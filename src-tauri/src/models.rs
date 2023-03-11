use std::path::PathBuf;

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
/// 要处理的图片。
pub struct Image {
    /// 本地路径
    pub path: PathBuf,
    // /// 旋转角度
    // rotate: i8,
    // /// 指定尺寸
    // size: (f32,f32),
    // /// 缩放比例。<scale>%
    // scale: i8
}
