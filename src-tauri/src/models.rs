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

pub struct PageSize(pub f64, pub f64);

pub enum PageType {
    Letter,
    A0,
    A1,
    A2,
    A3,
    A4,
    A5,
    A6,
    B0,
    B1,
    B2,
    B3,
    B4,
    B5,
    B6,
}

impl PageType {
    pub fn size(self) -> PageSize {
        match self {
            PageType::Letter => PageSize(612.0, 792.0),
            PageType::A4 => PageSize(595.2756, 841.8898),
            _ => PageSize(595.2756, 841.8898),
        }
    }
}
