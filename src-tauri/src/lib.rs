use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use std::path::PathBuf;
use std::fs;
use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    AppHandle, Manager, State,
};
use uuid::Uuid;

// Agent state
#[derive(Default)]
pub struct AgentState {
    pub device_id: Mutex<Option<String>>,
    pub api_url: Mutex<Option<String>>,
    pub device_token: Mutex<Option<String>>,
    pub is_online: Mutex<bool>,
    pub videos: Mutex<Vec<Video>>,
    pub folder_path: Mutex<Option<String>>,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct Video {
    pub id: String,
    pub filename: String,
    pub path: String,
    pub size: u64,
    pub mime_type: String,
    pub status: String,
    pub thumbnail: Option<String>,
    pub scheduled_for: Option<String>,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct ScheduledPost {
    pub id: String,
    pub content: String,
    pub platforms: Vec<String>,
    pub scheduled_at: String,
    pub video_filename: Option<String>,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct AppStatus {
    pub online: bool,
    pub device_id: Option<String>,
    pub videos: Vec<Video>,
    pub next_post: Option<ScheduledPost>,
    pub folder_path: String,
    pub last_sync: String,
}

// Get the default SMST videos folder
fn get_default_folder() -> PathBuf {
    let home = dirs::video_dir().unwrap_or_else(|| PathBuf::from("."));
    home.join("SMST")
}

fn ensure_folder_exists() -> PathBuf {
    let folder = get_default_folder();
    if !folder.exists() {
        let _ = fs::create_dir_all(&folder);
    }
    folder
}

fn get_file_mime_type(path: &str) -> String {
    let ext = std::path::Path::new(path)
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();
    
    match ext.as_str() {
        "mp4" => "video/mp4",
        "mov" => "video/quicktime",
        "avi" => "video/x-msvideo",
        "mkv" => "video/x-matroska",
        "webm" => "video/webm",
        _ => "video/*",
    }.to_string()
}

// Tauri commands
#[tauri::command]
async fn register_device(
    api_url: String,
    name: String,
    state: State<'_, AgentState>,
) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    
    // Get platform info
    let platform = if cfg!(target_os = "windows") {
        "windows"
    } else if cfg!(target_os = "macos") {
        "macos"
    } else {
        "linux"
    };
    
    let hostname = hostname::get()
        .map(|h| h.to_string_lossy().to_string())
        .unwrap_or_else(|_| "unknown".to_string());

    let response = client
        .post(format!("{}/api/agent", api_url))
        .json(&serde_json::json!({
            "name": name,
            "platform": platform,
            "hostname": hostname,
            "deviceType": "desktop"
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

    // Initialize folder
    let folder = ensure_folder_exists();
    *state.folder_path.lock().unwrap() = Some(folder.to_string_lossy().to_string());
    
    // Scan videos in folder
    scan_folder(&state);

    Ok(result)
}

fn scan_folder(state: &State<'_, AgentState>) {
    let folder = ensure_folder_exists();
    let mut videos = Vec::new();
    
    if let Ok(entries) = fs::read_dir(&folder) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_file() {
                let ext = path.extension()
                    .and_then(|e| e.to_str())
                    .unwrap_or("")
                    .to_lowercase();
                
                if ["mp4", "mov", "avi", "mkv", "webm"].contains(&ext.as_str()) {
                    let filename = path.file_name()
                        .and_then(|n| n.to_str())
                        .unwrap_or("unknown")
                        .to_string();
                    
                    let size = entry.metadata().map(|m| m.len()).unwrap_or(0);
                    
                    videos.push(Video {
                        id: Uuid::new_v4().to_string(),
                        filename,
                        path: path.to_string_lossy().to_string(),
                        size,
                        mime_type: get_file_mime_type(&path.to_string_lossy()),
                        status: "available".to_string(),
                        thumbnail: None,
                        scheduled_for: None,
                    });
                }
            }
        }
    }
    
    *state.videos.lock().unwrap() = videos;
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
            // Refresh videos
            scan_folder(&state);
            Ok(true)
        }
        _ => {
            *state.is_online.lock().unwrap() = false;
            Ok(false)
        }
    }
}

#[tauri::command]
fn get_status(state: State<'_, AgentState>) -> AppStatus {
    let is_online = *state.is_online.lock().unwrap();
    let device_id = state.device_id.lock().unwrap().clone();
    let videos = state.videos.lock().unwrap().clone();
    let folder_path = state.folder_path.lock().unwrap().clone()
        .unwrap_or_else(|| get_default_folder().to_string_lossy().to_string());
    
    // Get next scheduled post (would come from API in real implementation)
    let next_post = None;

    AppStatus {
        online: is_online,
        device_id,
        videos,
        next_post,
        folder_path,
        last_sync: chrono::Utc::now().to_rfc3339(),
    }
}

#[tauri::command]
fn open_videos_folder() -> Result<String, String> {
    let folder = ensure_folder_exists();
    let path = folder.to_string_lossy().to_string();
    
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(&path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    
    Ok(path)
}

#[tauri::command]
fn add_video_file(path: String, state: State<'_, AgentState>) -> Result<Video, String> {
    let source = PathBuf::from(&path);
    
    if !source.exists() {
        return Err("File not found".to_string());
    }
    
    let folder = ensure_folder_exists();
    let filename = source.file_name()
        .and_then(|n| n.to_str())
        .ok_or("Invalid filename")?;
    
    let dest = folder.join(filename);
    
    // Copy file to SMST folder
    fs::copy(&source, &dest).map_err(|e| e.to_string())?;
    
    let size = fs::metadata(&dest).map(|m| m.len()).unwrap_or(0);
    
    let video = Video {
        id: Uuid::new_v4().to_string(),
        filename: filename.to_string(),
        path: dest.to_string_lossy().to_string(),
        size,
        mime_type: get_file_mime_type(&path),
        status: "available".to_string(),
        thumbnail: None,
        scheduled_for: None,
    };
    
    state.videos.lock().unwrap().push(video.clone());
    
    Ok(video)
}

#[tauri::command]
fn delete_video(video_id: String, state: State<'_, AgentState>) -> Result<bool, String> {
    let mut videos = state.videos.lock().unwrap();
    let video = videos.iter().find(|v| v.id == video_id);
    
    if let Some(v) = video {
        // Delete file from disk
        let _ = fs::remove_file(&v.path);
    }
    
    videos.retain(|v| v.id != video_id);
    Ok(true)
}

#[tauri::command]
fn get_videos(state: State<'_, AgentState>) -> Vec<Video> {
    state.videos.lock().unwrap().clone()
}

#[tauri::command]
async fn sync_videos(state: State<'_, AgentState>) -> Result<Vec<Video>, String> {
    scan_folder(&state);
    Ok(state.videos.lock().unwrap().clone())
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
            // Ensure SMST folder exists
            let folder = ensure_folder_exists();
            log::info!("SMST folder: {:?}", folder);
            
            // Create system tray
            let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let show_item = MenuItem::with_id(app, "show", "Show Window", true, None::<&str>)?;
            let open_folder = MenuItem::with_id(app, "open_folder", "Open Videos Folder", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_item, &open_folder, &quit_item])?;

            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .tooltip("SMST Agent - Local Video Publishing")
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
                        "open_folder" => {
                            let _ = open_videos_folder();
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
            get_status,
            open_videos_folder,
            add_video_file,
            delete_video,
            get_videos,
            sync_videos
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
