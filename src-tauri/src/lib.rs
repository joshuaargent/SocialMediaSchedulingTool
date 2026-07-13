use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    Manager, State,
};
use chrono::{DateTime, Utc};
use sha2::{Sha256, Digest};

// Agent state
#[derive(Default)]
pub struct AgentState {
    pub device_id: Mutex<Option<String>>,
    pub api_url: Mutex<Option<String>>,
    pub device_token: Mutex<Option<String>>,
    pub is_online: Mutex<bool>,
    pub watch_folders: Mutex<Vec<WatchFolder>>,
    pub next_scheduled_post: Mutex<Option<ScheduledPost>>,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct WatchFolder {
    pub id: String,
    pub path: String,
    pub recursive: bool,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct ScheduledPost {
    pub id: String,
    pub content: String,
    pub platforms: Vec<String>,
    pub scheduled_at: String,
    pub local_video: Option<LocalVideo>,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct LocalVideo {
    pub id: String,
    pub path: String,
    pub filename: String,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct DeviceInfo {
    pub name: String,
    pub platform: String,
    pub hostname: String,
    pub device_type: String,
}

// Tauri commands
#[tauri::command]
async fn register_device(
    api_url: String,
    name: String,
    device_type: String,
    hostname: String,
    platform: String,
    state: State<'_, AgentState>,
) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    
    let response = client
        .post(format!("{}/api/agent", api_url))
        .json(&serde_json::json!({
            "organizationId": "demo-org",
            "userId": "demo-user",
            "name": name,
            "platform": platform,
            "hostname": hostname,
            "deviceType": device_type
        }))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !response.status().is_success() {
        return Err(format!("Registration failed: {}", response.status()));
    }

    let result: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;
    
    if let Some(device) = result.get("device") {
        *state.device_id.lock().unwrap() = device.get("id").and_then(|v| v.as_str()).map(|s| s.to_string());
        *state.api_url.lock().unwrap() = Some(api_url.clone());
        *state.device_token.lock().unwrap() = device.get("deviceToken").and_then(|v| v.as_str()).map(|s| s.to_string());
        *state.is_online.lock().unwrap() = true;
    }

    Ok(result)
}

#[tauri::command]
async fn send_heartbeat(state: State<'_, AgentState>) -> Result<bool, String> {
    let device_id = state.device_id.lock().unwrap().clone();
    let api_url = state.api_url.lock().unwrap().clone();
    
    if device_id.is_none() || api_url.is_none() {
        return Ok(false);
    }

    let client = reqwest::Client::new();
    let response = client
        .post(format!("{}/api/agent/heartbeat", api_url.as_ref().unwrap()))
        .json(&serde_json::json!({
            "deviceId": device_id.as_ref().unwrap(),
            "status": "online"
        }))
        .send()
        .await;

    match response {
        Ok(resp) if resp.status().is_success() => {
            *state.is_online.lock().unwrap() = true;
            Ok(true)
        }
        _ => {
            *state.is_online.lock().unwrap() = false;
            Ok(false)
        }
    }
}

#[tauri::command]
async fn get_scheduled_posts(state: State<'_, AgentState>) -> Result<Vec<ScheduledPost>, String> {
    let device_id = state.device_id.lock().unwrap().clone();
    let api_url = state.api_url.lock().unwrap().clone();
    
    if device_id.is_none() || api_url.is_none() {
        return Ok(vec![]);
    }

    let client = reqwest::Client::new();
    let response = client
        .get(format!(
            "{}/api/agent/scheduled?deviceId={}",
            api_url.as_ref().unwrap(),
            device_id.as_ref().unwrap()
        ))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !response.status().is_success() {
        return Ok(vec![]);
    }

    let result: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;
    
    let posts: Vec<ScheduledPost> = result
        .get("posts")
        .and_then(|p| p.as_array())
        .map(|arr| {
            arr.iter()
                .filter_map(|p| {
                    Some(ScheduledPost {
                        id: p.get("id")?.as_str()?.to_string(),
                        content: p.get("content")?.as_str()?.to_string(),
                        platforms: p.get("platforms")?.as_array()?.iter().filter_map(|s| s.as_str().map(String::from)).collect(),
                        scheduled_at: p.get("scheduledAt")?.as_str()?.to_string(),
                        local_video: p.get("localVideo").and_then(|v| {
                            Some(LocalVideo {
                                id: v.get("id")?.as_str()?.to_string(),
                                path: v.get("path")?.as_str()?.to_string(),
                                filename: v.get("filename")?.as_str()?.to_string(),
                            })
                        }),
                    })
                })
                .collect()
        })
        .unwrap_or_default();

    *state.next_scheduled_post.lock().unwrap() = posts.first().cloned();

    Ok(posts)
}

#[tauri::command]
async fn mark_post_published(
    post_id: String,
    success: bool,
    error: Option<String>,
    state: State<'_, AgentState>,
) -> Result<bool, String> {
    let device_id = state.device_id.lock().unwrap().clone();
    let api_url = state.api_url.lock().unwrap().clone();
    
    if device_id.is_none() || api_url.is_none() {
        return Ok(false);
    }

    let client = reqwest::Client::new();
    let response = client
        .post(format!("{}/api/agent/scheduled", api_url.as_ref().unwrap()))
        .json(&serde_json::json!({
            "postId": post_id,
            "status": if success { "published" } else { "failed" },
            "errorMessage": error,
            "deviceId": device_id.as_ref().unwrap()
        }))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    Ok(response.status().is_success())
}

#[tauri::command]
fn get_status(state: State<'_, AgentState>) -> serde_json::Value {
    let is_online = *state.is_online.lock().unwrap();
    let device_id = state.device_id.lock().unwrap().clone();
    let watch_folders = state.watch_folders.lock().unwrap().clone();
    let next_post = state.next_scheduled_post.lock().unwrap().clone();

    serde_json::json!({
        "online": is_online,
        "deviceId": device_id,
        "watchFolders": watch_folders,
        "nextPost": next_post
    })
}

#[tauri::command]
fn add_watch_folder(path: String, recursive: bool, state: State<'_, AgentState>) -> Result<WatchFolder, String> {
    let folder = WatchFolder {
        id: uuid::Uuid::new_v4().to_string(),
        path,
        recursive,
    };
    
    state.watch_folders.lock().unwrap().push(folder.clone());
    Ok(folder)
}

#[tauri::command]
fn remove_watch_folder(id: String, state: State<'_, AgentState>) -> Result<bool, String> {
    let mut folders = state.watch_folders.lock().unwrap();
    let initial_len = folders.len();
    folders.retain(|f| f.id != id);
    Ok(folders.len() < initial_len)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Info)
                .build(),
        )
        .manage(AgentState::default())
        .setup(|app| {
            // Create system tray
            let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let show_item = MenuItem::with_id(app, "show", "Show Window", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_item, &quit_item])?;

            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .tooltip("SMST Agent - Desktop Publishing")
                .on_menu_event(|app, event| {
                    match event.id.as_ref() {
                        "quit" => {
                            app.exit(0);
                        }
                        "show" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                        _ => {}
                    }
                })
                .build(app)?;

            log::info!("SMST Agent started successfully");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            register_device,
            send_heartbeat,
            get_scheduled_posts,
            mark_post_published,
            get_status,
            add_watch_folder,
            remove_watch_folder
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
