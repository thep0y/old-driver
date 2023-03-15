use crate::error::Result;
use std::{fs, path::Path};

pub fn create_dir<P: AsRef<Path>>(dir: P) -> Result<()> {
    let dir_ref: &Path = dir.as_ref();

    if !dir_ref.exists() {
        return Ok(());
    }

    match fs::create_dir(&dir_ref) {
        Ok(()) => {
            debug!("已创建目录：{:?}", dir_ref);
            return Ok(());
        }
        Err(e) => {
            error!("创建目录时出错：{}", e);
            return Err(e.to_string());
        }
    };
}
