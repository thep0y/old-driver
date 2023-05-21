use crate::error::Result;
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

lazy_static! {
    pub static ref APP_CONFIG_DIR: PathBuf = {
        let config_dir = dirs::config_dir().unwrap();

        let app_config_dir = config_dir.join("pod");

        if !app_config_dir.exists() {
            fs::create_dir(&app_config_dir).unwrap();
        }

        app_config_dir
    };
    static ref CONFIG_FILE: PathBuf = APP_CONFIG_DIR.join("config.toml");
}

fn default_compression() -> bool {
    false
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Config {
    #[serde(default = "default_compression")]
    pub compression: bool,
}

pub fn read_config() -> Result<Option<Config>> {
    trace!("读取配置文件");

    if !CONFIG_FILE.exists() {
        info!("配置文件不存在");
        return Ok(None);
    }

    debug!("配置文件存在");

    let config_str = fs::read_to_string(CONFIG_FILE.to_owned()).map_err(|e| {
        error!("读取配置文件时出错：{}", e);

        e.to_string()
    })?;

    debug!("配置文件内容：{}", config_str);

    toml::from_str(&config_str).map_err(|e| {
        error!("解析配置文件时出错：{}", e);
        e.to_string()
    })
}

pub fn write_config(config: &Config) -> Result<()> {
    trace!("保存的配置：{:?}", config);

    let config_str = toml::to_string(config).map_err(|e| {
        error!("序列化配置时出错: {}", e);
        e.to_string()
    })?;

    fs::write(CONFIG_FILE.to_owned(), config_str).map_err(|e| {
        error!("写入配置时出错：{}", e);
        e.to_string()
    })
}
