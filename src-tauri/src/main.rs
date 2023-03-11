#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod models;
mod pdf;

use std::path::PathBuf;

use crate::pdf::embedd_images_to_new_pdf;

// use tauri::Manager;
// use window_shadows::set_shadow;

#[tauri::command]
async fn merge_images_to_pdf(output: PathBuf, images: Vec<models::Image>) -> Result<(), String> {
    embedd_images_to_new_pdf(output, images);
    Ok(())
}

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        // .setup(|app| {
        //     let window = app.get_window("main").unwrap();
        //     set_shadow(&window, true).expect("Unsupported platform!");
        //     Ok(())
        // })
        .invoke_handler(tauri::generate_handler![merge_images_to_pdf])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
