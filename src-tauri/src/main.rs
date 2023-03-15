#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod error;
mod image;
mod logger;
mod models;
mod path;
mod pdf;

#[macro_use]
extern crate log;
extern crate simplelog;

use std::fs;
use std::{fs::File, path::PathBuf};

use crate::error::Result;
use crate::image::Thumbnail;
use crate::logger::{log_level, logger_config};
use crate::pdf::embedd_images_to_new_pdf;
use simplelog::{ColorChoice, CombinedLogger, TermLogger, TerminalMode, WriteLogger};

// use tauri::Manager;
// use window_shadows::set_shadow;

#[tauri::command]
async fn merge_images_to_pdf(output: PathBuf, images: Vec<models::Image>) -> Result<()> {
    embedd_images_to_new_pdf(output, images).await
}

#[tauri::command]
async fn generate_thumbnails(images: Vec<PathBuf>) -> Result<Vec<Thumbnail>> {
    debug!("创建缩略图 {:?}", images);

    let mut tasks = Vec::with_capacity(images.len());

    for ip in images {
        tasks.push(tokio::spawn(Thumbnail::new(ip)));
    }

    let mut outputs = Vec::with_capacity(tasks.len());
    for task in tasks {
        let res = task
            .await
            .map_err(|e| {
                error!("并发 join 出错：{}", e);
                e.to_string()
            })?
            .map_err(|e| {
                error!("并发处理缩略图时出错：{}", e);
                e.to_string()
            })?;

        outputs.push(res);
    }

    Ok(outputs)
}

#[cfg(target_os = "linux")]
fn set_gtk_scale_env() {
    let sesstion_type = match std::env::var("XDG_SESSION_TYPE") {
        Ok(e) => e,
        Err(_) => "X11".to_string(),
    };

    if sesstion_type.to_uppercase() == "X11" {
        std::env::set_var("GDK_SCALE", "2");
        std::env::set_var("GDK_DPI_SCALE", "0.5");
    }
}

#[tokio::main]
async fn main() {
    #[cfg(target_os = "linux")]
    set_gtk_scale_env();

    let config_dir = dirs::config_dir().unwrap();

    // 配置目录名符合不同系统的命名风格
    #[cfg(target_os = "windows")]
    let app_config_dir = config_dir.join("OldDriver");
    #[cfg(not(target_os = "windows"))]
    let app_config_dir = config_dir.join("old-driver");

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
        .invoke_handler(tauri::generate_handler![
            merge_images_to_pdf,
            generate_thumbnails
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
