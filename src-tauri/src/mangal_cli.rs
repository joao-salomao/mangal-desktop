use tauri::path::BaseDirectory;
use tauri::Manager;
use tauri_plugin_shell::process::CommandEvent;
use tauri_plugin_shell::ShellExt;

type CommandResult = Result<Vec<String>, CommandError>;

#[derive(Debug, Clone)]
struct CommandError {
    message: String,
}

#[tauri::command]
pub(crate) async fn get_available_sources(app_handle: tauri::AppHandle) -> CommandResult {
    // TODO: handle errors

    let path_buf = app_handle
        .path()
        .resolve("assets/mangal", BaseDirectory::Resource)
        .unwrap();

    let mangal_config_path = path_buf.as_path().to_str().unwrap();

    let sidecar_command = app_handle.shell().sidecar("mangal-cli").unwrap();

    let (mut receiver, _child) = sidecar_command
        .args(["sources", "list", "-r"])
        .env("MANGAL_CLI_PATH", mangal_config_path)
        .spawn()
        .expect("Failed to spawn sidecar");

    let mut outputs: Vec<String> = Vec::new();
    let mut errors: Vec<String> = Vec::new();

    while let Some(event) = receiver.recv().await {
        match event {
            CommandEvent::Stdout(line_bytes) => {
                let value: String = String::from_utf8_lossy(&line_bytes).trim().parse().unwrap();
                outputs.push(value);
            }
            CommandEvent::Stderr(line_bytes) => {
                let value: String = String::from_utf8_lossy(&line_bytes).trim().parse().unwrap();
                errors.push(value);
            }
            CommandEvent::Error(error) => {
                return Err(CommandError {
                    message: error.trim().to_string(),
                });
            }
            CommandEvent::Terminated(_) => {
                break
            },
            _ => {}
        }
    }

    if !errors.is_empty() {
        return Err(CommandError {
            message: errors.join("\n"),
        });
    }

    Ok(outputs)
}
