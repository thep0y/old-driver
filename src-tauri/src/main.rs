#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod image;
mod logger;
mod models;
mod pdf;

#[macro_use]
extern crate log;
extern crate simplelog;

use std::fs;
use std::io::Error;
use std::process::Command;
use std::{fs::File, path::PathBuf};

#[cfg(not(target_os = "windows"))]
use tauri::api::shell;

use crate::image::Thumbnail;
use crate::logger::{log_level, logger_config};
use crate::pdf::embedd_images_to_new_pdf;
use simplelog::{ColorChoice, CombinedLogger, TermLogger, TerminalMode, WriteLogger};

// use tauri::Manager;
// use window_shadows::set_shadow;

#[tauri::command]
async fn merge_images_to_pdf(output: PathBuf, images: Vec<models::Image>) -> Result<(), String> {
    embedd_images_to_new_pdf(output, images).map_err(|err| err.to_string())
}

#[tauri::command]
async fn generate_thumbnails(images: Vec<PathBuf>) -> Vec<Thumbnail> {
    debug!("创建缩略图 {:?}", images);
    // let mut thumbnails = Vec::<Thumbnail>::new();

    let mut tasks = Vec::with_capacity(images.len());

    for ip in images {
        tasks.push(tokio::spawn(Thumbnail::new(ip)));
    }

    let mut outputs = Vec::with_capacity(tasks.len());
    for task in tasks {
        outputs.push(task.await.unwrap());
    }

    outputs
}

#[cfg(target_os = "windows")]
fn open_with_command(path: &str) -> Result<(), Error> {
    let mut cmd = Command::new("cmd");
    cmd.arg("/c").arg("start").arg("").arg(path);
    cmd.output()?;

    Ok(())
}

#[cfg(target_os = "windows")]
#[tauri::command]
async fn open_file(path: String) -> Result<(), String> {
    debug!("打开 {}", path);

    open_with_command(&path).map_err(|err| {
        error!("打开文件时出错：{}", err);

        return err.to_string();
    })?;

    Ok(())
}

// TODO: linux 或 macos 也有打开文件错误时再修改此方法
// #[cfg(not(target_os = "windows"))]
// #[tauri::command]
// async fn open_file(handle: tauri::AppHandle, path: String) -> Result<(), String> {
//     debug!("打开 {}", path);

//     #[cfg(not(target_os = "windows"))]
//     match shell::open(&handle.app_handle().shell_scope(), path, None) {
//         Ok(()) => {}
//         Err(e) => {
//             error!("打开文件时出错：{}", e);
//             return Err(e.to_string());
//         }
//     };

//     Ok(())
// }

#[tokio::main]
async fn main() {
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

    let mut app = tauri::Builder::default();
    // .setup(|app| {
    //     let window = app.get_window("main").unwrap();
    //     set_shadow(&window, true).expect("Unsupported platform!");
    //     Ok(())
    // })

    app = if cfg!(target_os = "windows") {
        app.invoke_handler(tauri::generate_handler![
            merge_images_to_pdf,
            generate_thumbnails,
            open_file
        ])
    } else {
        app.invoke_handler(tauri::generate_handler![
            merge_images_to_pdf,
            generate_thumbnails
        ])
    };
    app.run(tauri::generate_context!())
        .expect("error while running tauri application");
}
