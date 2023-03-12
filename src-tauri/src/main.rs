#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod logger;
mod models;
mod pdf;

#[macro_use]
extern crate log;
extern crate simplelog;

use std::fs;
use std::{env, fs::File, path::PathBuf};

use crate::logger::{log_level, logger_config};
use crate::pdf::embedd_images_to_new_pdf;
use simplelog::{ColorChoice, CombinedLogger, TermLogger, TerminalMode, WriteLogger};

// use tauri::Manager;
// use window_shadows::set_shadow;

#[tauri::command]
async fn merge_images_to_pdf(output: PathBuf, images: Vec<models::Image>) -> Result<(), String> {
    match embedd_images_to_new_pdf(output, images) {
        Ok(()) => Ok(()),
        Err(e) => Err(e),
    }
}

#[tokio::main]
async fn main() {
    let config_dir = dirs::config_dir().unwrap();
    let app_config_dir = config_dir.join("pdf-old-driver");
    if !app_config_dir.exists() {
        fs::create_dir(&app_config_dir).unwrap();
    }

    // trace 应该记录每一步代码的输出，用来追溯程序的运行情况。
    // debug 和 trace 没有本质上的区别，如果用来区分，则 debug 可以用来记录一些不重要的变量的日志。
    CombinedLogger::init(vec![
        TermLogger::new(
            log_level(),
            logger_config(true),
            TerminalMode::Mixed,
            ColorChoice::Auto,
        ),
        WriteLogger::new(
            log_level(),
            logger_config(true),
            File::create(app_config_dir.join("old-driver.log")).unwrap(),
        ),
    ])
    .unwrap();

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
