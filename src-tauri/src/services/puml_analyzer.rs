use crate::models::puml::{
    PlantUmlAnalysis,
    PlantUmlAttribute,
    PlantUmlEntity,
};
pub fn analyze_puml_content(
    content: &str,
) -> PlantUmlAnalysis {
    let mut analysis =
        PlantUmlAnalysis {
            classes: Vec::new(),
            enums: Vec::new(),
            records: Vec::new(),
            sealed: Vec::new(),
            abstract_classes: Vec::new(),
            interfaces: Vec::new(),
            relationships: Vec::new(),
        };
    let mut current_entity:
        Option<PlantUmlEntity> = None;
    let mut brace_depth: i32 = 0;
    let mut pending_declaration =
        String::new();
    for raw_line in content.lines() {
        let line =
            raw_line.trim();
        if line.is_empty() {
            continue;
        }
        if line.starts_with("'")
            || line.starts_with("//")
        {
            continue;
        }
        if line.eq_ignore_ascii_case("@enduml") {
            if let Some(entity) =
                current_entity.take()
            {
                add_entity(
                    &mut analysis,
                    entity,
                );
            }
            break;
        }
        if current_entity.is_some() {
            if line.starts_with('}') {
                let content_line =
                    line.trim_start_matches('}')
                        .trim();
                if !content_line.is_empty() {
                    parse_entity_member(
                        current_entity
                            .as_mut()
                            .unwrap(),
                        content_line,
                    );
                }
                brace_depth -= 1;
                if brace_depth <= 0 {
                    if let Some(entity) =
                        current_entity.take()
                    {
                        add_entity(
                            &mut analysis,
                            entity,
                        );
                    }
                    brace_depth = 0;
                }
                continue;
            }
            parse_entity_member(
                current_entity
                    .as_mut()
                    .unwrap(),
                line,
            );
            brace_depth +=
                count_open_braces(line);
            brace_depth -=
                count_close_braces(line);
            continue;
        }
        if !pending_declaration.is_empty() {
            pending_declaration.push(' ');
            pending_declaration
                .push_str(line);
            if pending_declaration
                .contains(')')
            {
                let declaration =
                    pending_declaration
                        .clone();
                pending_declaration
                    .clear();
                if let Some((
                    entity,
                    _category,
                )) =
                    parse_entity_declaration(
                        &declaration,
                    )
                {
                    current_entity =
                        Some(entity);
                    brace_depth = 0;
                }
            }
            continue;
        }
        if is_entity_declaration(line) {
            if line.contains('(')
                && !line.contains(')')
            {
                pending_declaration =
                    line.to_string();
                continue;
            }
            if let Some((
                mut entity,
                _category,
            )) =
                parse_entity_declaration(
                    line,
                )
            {
                if line.contains('{') {
                    brace_depth =
                        count_open_braces(
                            line,
                        )
                        -
                        count_close_braces(
                            line,
                        );
                    entity.name =
                        clean_entity_name(
                            &entity.name,
                        );
                    current_entity =
                        Some(entity);
                } else {
                    add_entity(
                        &mut analysis,
                        entity,
                    );
                }
            }
            continue;
        }
    }
    if let Some(entity) =
        current_entity.take()
    {
        add_entity(
            &mut analysis,
            entity,
        );
    }
    analysis
}
fn add_entity(
    analysis: &mut PlantUmlAnalysis,
    entity: PlantUmlEntity,
) {
    match entity.category
        .to_uppercase()
        .as_str()
    {
        "CLASES" => {
            analysis.classes.push(entity);
        }
        "ENUMS" => {
            analysis.enums.push(entity);
        }
        "RECORD" => {
            analysis.records.push(entity);
        }
        "SEALED" => {
            analysis.sealed.push(entity);
        }
        "ABSTRACTAS" => {
            analysis
                .abstract_classes
                .push(entity);
        }
        "INTERFACES" => {
            analysis.interfaces.push(entity);
        }
        _ => {}
    }
}
fn is_entity_declaration(
    line: &str,
) -> bool {
    let lower =
        line.to_lowercase();
    lower.starts_with("class ")
        || lower.starts_with("abstract class ")
        || lower.starts_with("sealed class ")
        || lower.starts_with("record ")
        || lower.starts_with("interface ")
        || lower.starts_with("enum ")
}
fn parse_entity_declaration(
    line: &str,
) -> Option<(PlantUmlEntity, String)> {
    let mut text =
        line.trim();
    if text.is_empty() {
        return None;
    }
    if text.starts_with('@') {
        return None;
    }
    if text.starts_with("'")
        || text.starts_with("//")
    {
        return None;
    }
    if let Some(position) =
        text.find('{')
    {
        text =
            text[..position]
                .trim();
    }
    if text.is_empty() {
        return None;
    }
    let lower =
        text.to_lowercase();
    let (
        mut category,
        entity_type,
        is_abstract,
        is_sealed,
    ) =
        if lower.starts_with(
            "abstract class ",
        )
        {
            (
                "ABSTRACTAS",
                "class",
                true,
                false,
            )
        } else if lower.starts_with(
            "sealed class ",
        )
        {
            (
                "SEALED",
                "class",
                false,
                true,
            )
        } else if lower.starts_with(
            "record ",
        )
        {
            (
                "RECORD",
                "record",
                false,
                false,
            )
        } else if lower.starts_with(
            "interface ",
        )
        {
            (
                "INTERFACES",
                "interface",
                false,
                false,
            )
        } else if lower.starts_with(
            "enum ",
        )
        {
            (
                "ENUMS",
                "enum",
                false,
                false,
            )
        } else if lower.starts_with(
            "class ",
        )
        {
            (
                "CLASES",
                "class",
                false,
                false,
            )
        } else {
            return None;
        };
    let keyword =
        if is_abstract {
            "abstract class"
        } else if is_sealed {
            "sealed class"
        } else {
            entity_type
        };
    let remainder =
        text
            [keyword.len()..]
            .trim();
    if remainder.is_empty() {
        return None;
    }
    let stereotype =
        extract_stereotype(text);
    let is_record_stereotype =
        stereotype
            .as_deref()
            .map(|value| {
                value
                    .eq_ignore_ascii_case(
                        "record",
                    )
            })
            .unwrap_or(false);
    if entity_type == "class"
        && is_record_stereotype
    {
        category = "RECORD";
    }
    let mut record_components =
        Vec::new();
    let name;
    if entity_type == "record"
        && remainder.contains('(')
    {
        let open =
            remainder.find('(');
        let close =
            remainder.rfind(')');
        if let (
            Some(open),
            Some(close),
        ) = (open, close)
        {
            name =
                clean_entity_name(
                    remainder[..open]
                        .trim(),
                );
            let component_text =
                remainder[
                    open + 1..close
                ]
                .trim();
            record_components =
                parse_record_components(
                    component_text,
                );
        } else {
            name =
                clean_entity_name(
                    remainder
                        .split_whitespace()
                        .next()
                        .unwrap_or(""),
                );
        }
    } else {
        name =
            clean_entity_name(
                remainder
                    .split_whitespace()
                    .next()
                    .unwrap_or(""),
            );
    }
    if name.is_empty() {
        return None;
    }
    let extends =
        extract_relation_target(
            text,
            "extends",
        );
    let implements =
        extract_implements(text);
    let entity =
        PlantUmlEntity {
            name,
            category:
                category.to_string(),
            stereotype,
            visibility:
                None,
            is_abstract,
            is_sealed,
            attributes:
                Vec::new(),
            methods:
                Vec::new(),
            constructors:
                Vec::new(),
            enum_values:
                Vec::new(),
            record_components,
            extends,
            implements,
            uses:
                Vec::new(),
        };
    Some((
        entity,
        category.to_string(),
    ))
}
fn parse_record_components(
    text: &str,
) -> Vec<PlantUmlAttribute> {
    if text.trim().is_empty() {
        return Vec::new();
    }
    text.split(',')
        .filter_map(
            |component| {
                let component =
                    component.trim();
                if component.is_empty() {
                    return None;
                }
                if let Some(position) =
                    component.find(':')
                {
                    let name =
                        component
                            [..position]
                            .trim()
                            .to_string();
                    let type_name =
                        component
                            [position + 1..]
                            .trim()
                            .to_string();
                    if name.is_empty() {
                        return None;
                    }
                    return Some(
                        PlantUmlAttribute {
                            name,
                            type_name,
                            visibility:
                                None,
                            is_static:
                                false,
                            is_final:
                                false,
                        }
                    );
                }
                let parts:
                    Vec<&str> =
                    component
                        .split_whitespace()
                        .collect();
                if parts.len() >= 2 {
                    let type_name =
                        parts
                            [..parts.len() - 1]
                            .join(" ");
                    let name =
                        parts[
                            parts.len() - 1
                        ]
                        .to_string();
                    return Some(
                        PlantUmlAttribute {
                            name,
                            type_name,
                            visibility:
                                None,
                            is_static:
                                false,
                            is_final:
                                false,
                        }
                    );
                }
                Some(
                    PlantUmlAttribute {
                        name:
                            component
                                .to_string(),
                        type_name:
                            String::new(),
                        visibility:
                            None,
                        is_static:
                            false,
                        is_final:
                            false,
                    }
                )
            }
        )
        .collect()
}
fn parse_entity_member(
    entity: &mut PlantUmlEntity,
    line: &str,
) {
    let mut text =
        line.trim();
    if text.is_empty() {
        return;
    }
    if text == "{"
        || text == "}"
    {
        return;
    }
    if text.starts_with('@') {
        return;
    }
    if entity.category == "ENUMS" {
        parse_enum_member(
            entity,
            text,
        );
        return;
    }
    if entity.category == "RECORD" {
        if looks_like_method(text) {
            if let Some(method) =
                parse_method(text)
            {
                entity.methods.push(
                    method
                );
            }
            return;
        }
        if looks_like_constructor(
            text,
            &entity.name,
        ) {
            if let Some(constructor) =
                parse_constructor(text)
            {
                entity.constructors
                    .push(constructor);
            }
            return;
        }
        if let Some(attribute) =
            parse_attribute(text)
        {
            entity
                .record_components
                .push(attribute);
            return;
        }
        return;
    }
    if looks_like_method(text) {
        if let Some(method) =
            parse_method(text)
        {
            entity.methods.push(
                method
            );
        }
        return;
    }
    if looks_like_constructor(
        text,
        &entity.name,
    ) {
        if let Some(constructor) =
            parse_constructor(text)
        {
            entity.constructors
                .push(constructor);
        }
        return;
    }
    if let Some(attribute) =
        parse_attribute(text)
    {
        entity.attributes.push(
            attribute
        );
        return;
    }
}
fn parse_enum_member(
    entity: &mut PlantUmlEntity,
    line: &str,
) {
    let text =
        line.trim();
    if text.is_empty() {
        return;
    }
    if looks_like_method(text) {
        if let Some(method) =
            parse_method(text)
        {
            entity.methods.push(
                method
            );
        }
        return;
    }
    if text.contains(':') {
        if let Some(attribute) =
            parse_attribute(text)
        {
            entity.attributes.push(
                attribute
            );
        }
        return;
    }
    let clean =
        text
            .trim_end_matches(',')
            .trim();
    if !clean.is_empty()
        && !clean.starts_with('}')
    {
        entity
            .enum_values
            .push(clean.to_string());
    }
}
fn parse_attribute(
    line: &str,
) -> Option<PlantUmlAttribute> {
    let text =
        line.trim();
    if text.is_empty() {
        return None;
    }
    if text.contains("--")
        || text.contains("..")
        || text.contains("->")
        || text.contains("<-")
        || text.contains("o--")
        || text.contains("*--")
    {
        return None;
    }
    let position =
        text.find(':')?;
    let left =
        text[..position]
            .trim();
    let right =
        text[position + 1..]
            .trim();
    if left.is_empty()
        || right.is_empty()
    {
        return None;
    }
    let mut visibility =
        None;
    let mut name =
        left.to_string();
    if let Some(first) =
        left.chars().next()
    {
        match first {
            '+' |
            '-' |
            '#' |
            '~' => {
                visibility =
                    Some(
                        first.to_string()
                    );
                name =
                    left[1..]
                        .trim()
                        .to_string();
            }
            _ => {}
        }
    }
    let is_static =
        name.contains("{static}")
        || right.contains("{static}");
    let is_final =
        name.contains("{final}")
        || right.contains("{final}");
    name =
        name
            .replace(
                "{static}",
                "",
            )
            .replace(
                "{final}",
                "",
            )
            .trim()
            .to_string();
    let type_name =
        right
            .replace(
                "{static}",
                "",
            )
            .replace(
                "{final}",
                "",
            )
            .trim()
            .to_string();
    if name.is_empty() {
        return None;
    }
    Some(
        PlantUmlAttribute {
            name,
            type_name,
            visibility,
            is_static,
            is_final,
        }
    )
}
fn parse_method(
    line: &str,
) -> Option<crate::models::puml::PlantUmlMethod>
{
    let text =
        line.trim();
    let open =
        text.find('(')?;
    let close =
        text.rfind(')')?;
    if close < open {
        return None;
    }
    let before =
        text[..open]
            .trim();
    let parameters_text =
        text[
            open + 1..close
        ]
        .trim();
    let after =
        text[
            close + 1..
        ]
        .trim();
    let mut visibility =
        None;
    let mut method_name =
        before.to_string();
    if let Some(first) =
        before.chars().next()
    {
        match first {
            '+' |
            '-' |
            '#' |
            '~' => {
                visibility =
                    Some(
                        first.to_string()
                    );
                method_name =
                    before[1..]
                        .trim()
                        .to_string();
            }
            _ => {}
        }
    }
    if method_name.is_empty() {
        return None;
    }
    let return_type =
        if let Some(position) =
            after.find(':')
        {
            after[
                position + 1..
            ]
            .trim()
            .to_string()
        } else {
            String::new()
        };
    let parameters =
        parse_parameters(
            parameters_text
        );
    Some(
        crate::models::puml::PlantUmlMethod {
            name:
                method_name,
            visibility,
            parameters,
            return_type,
            is_static: text.contains("{static}"),
            is_abstract: text.contains("{abstract}"),
        }
    )
}
fn parse_constructor(
    line: &str,
) -> Option<crate::models::puml::PlantUmlConstructor>
{
    let text =
        line.trim();
    let open =
        text.find('(')?;
    let close =
        text.rfind(')')?;
    let before =
        text[..open]
            .trim();
    let parameters_text =
        text[
            open + 1..close
        ]
        .trim();
    let mut visibility =
        None;
    let mut name =
        before.to_string();
    if let Some(first) =
        before.chars().next()
    {
        match first {
            '+' |
            '-' |
            '#' |
            '~' => {
                visibility =
                    Some(
                        first.to_string()
                    );
                name =
                    before[1..]
                        .trim()
                        .to_string();
            }
            _ => {}
        }
    }
    if name.is_empty() {
        return None;
    }
    Some(
        crate::models::puml::PlantUmlConstructor {
            name,
            visibility,
            parameters:
                parse_parameters(
                    parameters_text
                ),
        }
    )
}
fn parse_parameters(
    text: &str,
) -> Vec<crate::models::puml::PlantUmlParameter>
{
    if text.trim().is_empty() {
        return Vec::new();
    }
    text.split(',')
        .filter_map(
            |parameter| {
                let parameter =
                    parameter.trim();
                if parameter.is_empty() {
                    return None;
                }
                if let Some(position) =
                    parameter.find(':')
                {
                    let name =
                        parameter
                            [..position]
                            .trim()
                            .to_string();
                    let type_name =
                        parameter
                            [position + 1..]
                            .trim()
                            .to_string();
                    return Some(
                        crate::models::puml::PlantUmlParameter {
                            name,
                            type_name,
                        }
                    );
                }
                let parts:
                    Vec<&str> =
                    parameter
                        .split_whitespace()
                        .collect();
                if parts.len() >= 2 {
                    return Some(
                        crate::models::puml::PlantUmlParameter {
                            name:
                                parts[
                                    parts.len() - 1
                                ]
                                .to_string(),
                            type_name:
                                parts[
                                    ..parts.len() - 1
                                ]
                                .join(" "),
                        }
                    );
                }
                Some(
                    crate::models::puml::PlantUmlParameter {
                        name:
                            parameter.to_string(),
                        type_name:
                            String::new(),
                    }
                )
            }
        )
        .collect()
}
fn looks_like_method(
    line: &str,
) -> bool {
    line.contains('(')
        && line.contains(')')
}
fn looks_like_constructor(
    line: &str,
    entity_name: &str,
) -> bool {
    let clean_line =
        line.trim_start_matches(
            ['+', '-', '#', '~']
        );
    let name =
        clean_line
            .split('(')
            .next()
            .unwrap_or("")
            .trim();
    name == entity_name
}
fn extract_stereotype(
    text: &str,
) -> Option<String> {
    let start =
        text.find("<<")?;
    let remainder =
        &text[start + 2..];
    let end =
        remainder.find(">>")?;
    let stereotype =
        remainder[..end]
            .trim();
    if stereotype.is_empty() {
        None
    } else {
        Some(
            stereotype.to_string()
        )
    }
}
fn extract_relation_target(
    text: &str,
    keyword: &str,
) -> Option<String> {
    let lower =
        text.to_lowercase();
    let position =
        lower.find(keyword)?;
    let remainder =
        text[
            position + keyword.len()..
        ]
        .trim();
    let target =
        remainder
            .split_whitespace()
            .next()
            .unwrap_or("")
            .trim_matches('{')
            .trim_matches('}')
            .trim_matches(':');
    if target.is_empty() {
        None
    } else {
        Some(
            target.to_string()
        )
    }
}
fn extract_implements(
    text: &str,
) -> Vec<String> {
    let lower =
        text.to_lowercase();
    let Some(position) =
        lower.find("implements")
    else {
        return Vec::new();
    };
    let remainder =
        text[
            position + "implements".len()..
        ]
        .trim();
    remainder
        .split(',')
        .map(|item| {
            item
                .trim()
                .split_whitespace()
                .next()
                .unwrap_or("")
                .trim_matches('{')
                .trim_matches('}')
                .trim_matches(':')
                .to_string()
        })
        .filter(|item| !item.is_empty())
        .collect()
}
fn clean_entity_name(
    name: &str,
) -> String {
    name
        .trim()
        .trim_matches('{')
        .trim_matches('}')
        .trim_matches(':')
        .trim_matches('"')
        .trim_matches('\'')
        .trim()
        .to_string()
}
fn count_open_braces(
    text: &str,
) -> i32 {
    text.matches('{').count() as i32
}
fn count_close_braces(
    text: &str,
) -> i32 {
    text.matches('}').count() as i32
}