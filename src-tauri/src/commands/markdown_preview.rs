use pulldown_cmark::{Parser, html};

#[tauri::command]
pub fn markdown_to_html(input: String) -> Result<String, String> {
    let parser = Parser::new(&input);
    let mut html_output = String::new();
    html::push_html(&mut html_output, parser);
    Ok(html_output)
}
