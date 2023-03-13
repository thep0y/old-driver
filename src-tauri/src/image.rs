use base64::{engine::general_purpose, Engine as _};
use image::ImageOutputFormat;
use lazy_static::lazy_static;
use serde::Serialize;
use std::fs;
use std::io::Cursor;
use std::path::PathBuf;

use image::io::Reader as ImageReader;
use image::{imageops::thumbnail, DynamicImage};

use crate::error::Result;

/// 缩略图最大宽度
const MAX_THUMBNAIL_WIDTH: u16 = 210;
/// 缩略图最大高度
const MAX_THUMBNAIL_HEIGHT: u16 = 297;

lazy_static! {
    static ref TEMP_DIR: PathBuf = {
        let mut cache_dir = dirs::cache_dir().unwrap();
        if cfg!(target_os = "windows") {
            cache_dir = cache_dir.join("OldDriver");
        } else {
            cache_dir = cache_dir.join("old-driver");
        };

        if !cache_dir.exists() {
            fs::create_dir(&cache_dir).unwrap();
        }

        cache_dir
    };
}

#[derive(Debug)]
pub struct ImageSize {
    pub width: u32,
    pub height: u32,
}

impl From<(u32, u32)> for ImageSize {
    fn from(value: (u32, u32)) -> Self {
        ImageSize {
            width: value.0,
            height: value.1,
        }
    }
}

impl From<(f32, f32)> for ImageSize {
    fn from(value: (f32, f32)) -> Self {
        ImageSize {
            width: value.0.round() as u32,
            height: value.1.round() as u32,
        }
    }
}

impl Into<(f32, f32)> for ImageSize {
    fn into(self) -> (f32, f32) {
        (self.width as f32, self.height as f32)
    }
}

pub fn scale(image_size: &ImageSize, max_size: &ImageSize) -> ImageSize {
    let (scale_width, scale_height) = (
        image_size.width as f32 / max_size.width as f32,
        image_size.height as f32 / max_size.height as f32,
    );

    if scale_width <= 1. && scale_height <= 1. {
        if scale_width < scale_height {
            return ImageSize::from((
                image_size.width as f32 * scale_width,
                image_size.height as f32 * scale_width,
            ));
        }

        return ImageSize::from((
            image_size.width as f32 * scale_height,
            image_size.height as f32 * scale_height,
        ));
    }

    if scale_width <= 1. && scale_height > 1. {
        return ImageSize::from((
            image_size.width as f32 / scale_height,
            image_size.height as f32 / scale_height,
        ));
    }

    if scale_width > 1. && scale_height <= 1. {
        return ImageSize::from((
            image_size.width as f32 / scale_width,
            image_size.height as f32 / scale_width,
        ));
    }

    if scale_width > 1. && scale_height > 1. {
        if scale_width < scale_height {
            return ImageSize::from((
                image_size.width as f32 / scale_height,
                image_size.height as f32 / scale_height,
            ));
        }

        return ImageSize::from((
            image_size.width as f32 / scale_width,
            image_size.height as f32 / scale_width,
        ));
    }

    ImageSize::from((image_size.width, image_size.height))
}

#[derive(Debug, Serialize)]
pub struct Thumbnail {
    pub src: PathBuf,
    pub base64: String,
    pub name: String,
}

impl Thumbnail {
    pub async fn new(image_path: PathBuf) -> Result<Thumbnail> {
        trace!("创建缩略图：{:?}", image_path);

        let b = Self::new_from_path(&image_path)
            .await
            .map_err(|err| err.to_string())?;

        Ok(Thumbnail {
            src: image_path.clone(),
            base64: "data:image/png;base64, ".to_string() + &b,
            name: image_path
                .file_name()
                .unwrap()
                .to_str()
                .unwrap()
                .to_string(),
        })
    }

    fn conver_size(img: &DynamicImage) -> ImageSize {
        scale(
            &ImageSize {
                width: img.width().into(),
                height: img.height().into(),
            },
            &ImageSize {
                width: MAX_THUMBNAIL_WIDTH.into(),
                height: MAX_THUMBNAIL_HEIGHT.into(),
            },
        )
    }

    async fn new_from_path(image_path: &PathBuf) -> Result<String> {
        let reader = ImageReader::open(image_path).map_err(|err| {
            error!("读取图片时出错：{}", err);
            err.to_string()
        })?;
        let img = reader.decode().map_err(|err| {
            error!("图片解码时出错：{}", err);
            err.to_string()
        })?;

        Self::new_from_image(image_path, &img).await
    }

    async fn new_from_image(image_path: &PathBuf, img: &DynamicImage) -> Result<String> {
        let scaled_size = Self::conver_size(img);
        trace!("缩略图 {:?} 尺寸 {:?}", image_path, scaled_size);

        let image_buf = thumbnail(img, scaled_size.width, scaled_size.height);

        let mut buffer: Vec<u8> = Vec::new();

        image_buf
            .write_to(&mut Cursor::new(&mut buffer), ImageOutputFormat::Png)
            .map_err(|err| {
                error!("图片缓存写入缓存时出错：{}", err);
                err.to_string()
            })?;

        Ok(general_purpose::STANDARD.encode(buffer))
    }
}
