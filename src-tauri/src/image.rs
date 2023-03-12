use lazy_static::lazy_static;
use std::fs::{self, File};
use std::io::Read;
use std::path::PathBuf;

use image::{imageops::thumbnail, DynamicImage};

/// 缩略图最大宽度
const MAX_THUMBNAIL_WIDTH: u16 = 226;
/// 缩略图最大高度
const MAX_THUMBNAIL_HEIGHT: u16 = 297;

lazy_static! {
    static ref TIMP_DIR: PathBuf = {
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

struct Thumbnail;

impl Thumbnail {
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

    fn new_from_path(image_path: &PathBuf) {
        let mut file = File::open(image_path).unwrap();
        let mut buffer = Vec::new();
        file.read_to_end(&mut buffer).unwrap();
        let img = image::load_from_memory(buffer.as_ref()).unwrap();

        Self::new_from_image(&img);
    }

    fn new_from_image(img: &DynamicImage) {
        let scaled_size = Self::conver_size(img);
        println!("缩略图尺寸 {:?}", scaled_size);

        let buf = thumbnail(img, scaled_size.width, scaled_size.height);
        buf.save("thumbnail.jpg").unwrap();
    }
}
