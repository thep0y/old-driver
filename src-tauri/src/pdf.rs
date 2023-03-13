use image::{ColorType, DynamicImage, GenericImageView, ImageFormat, Pixel, RgbImage};
use lopdf::{dictionary, ObjectId};
use lopdf::{Dictionary, Document, Object, Result, Stream};
use std::fs::File;
use std::io::prelude::*;
use std::path::PathBuf;

use crate::image::{scale, ImageSize};
use crate::models;

#[derive(Debug)]
struct Position {
    x: u32,
    y: u32,
}

impl From<Position> for (u32, u32) {
    fn from(value: Position) -> Self {
        (value.x as u32, value.y as u32)
    }
}

impl From<(u32, u32)> for Position {
    fn from(value: (u32, u32)) -> Self {
        Position {
            x: value.0,
            y: value.1,
        }
    }
}

impl From<(f32, f32)> for Position {
    fn from(value: (f32, f32)) -> Self {
        Position {
            x: value.0.round() as u32,
            y: value.1.round() as u32,
        }
    }
}

impl Into<(f32, f32)> for Position {
    fn into(self) -> (f32, f32) {
        (self.x as f32, self.y as f32)
    }
}

#[derive(Debug)]
pub struct PageSize {
    pub width: u32,
    pub height: u32,
}

impl From<(u32, u32)> for PageSize {
    fn from(value: (u32, u32)) -> Self {
        PageSize {
            width: value.0,
            height: value.1,
        }
    }
}

impl From<(f32, f32)> for PageSize {
    fn from(value: (f32, f32)) -> Self {
        PageSize {
            width: value.0.round() as u32,
            height: value.1.round() as u32,
        }
    }
}

impl From<&PageSize> for ImageSize {
    fn from(value: &PageSize) -> Self {
        ImageSize {
            width: value.width,
            height: value.height,
        }
    }
}

#[derive(Debug)]
pub enum PageType {
    // Letter,
    // A0,
    // A1,
    // A2,
    // A3,
    A4,
    // A5,
    // A6,
    // B0,
    // B1,
    // B2,
    // B3,
    // B4,
    // B5,
    // B6,
}

pub fn page_size(page_type: &PageType) -> PageSize {
    match *page_type {
        // PageType::Letter => PageSize(612.0, 792.0),
        PageType::A4 => PageSize::from((595.2756, 841.8898)),
    }
}

struct ImageObject {}

impl ImageObject {
    async fn new(path: PathBuf) -> Result<(Stream, ImageSize)> {
        let mut file = File::open(&path)?;
        let mut buffer = Vec::new();
        file.read_to_end(&mut buffer)?;

        debug!("处理一张 pdf 图片: {:?}", path);

        Self::image_from(buffer).await
    }

    fn color_space(color_type: ColorType) -> Vec<u8> {
        match color_type {
            ColorType::L8 => b"DeviceGray".to_vec(),
            ColorType::La8 => b"DeviceGray".to_vec(),
            ColorType::Rgb8 => b"DeviceRGB".to_vec(),
            ColorType::Rgb16 => b"DeviceRGB".to_vec(),
            ColorType::La16 => b"DeviceN".to_vec(),
            ColorType::Rgba8 => b"DeviceRGB".to_vec(),
            ColorType::Rgba16 => b"DeviceN".to_vec(),
            _ => b"Indexed".to_vec(),
        }
    }

    fn set_image_dict(width: u32, height: u32, color_space: Vec<u8>, bits: u16) -> Dictionary {
        let mut dict = Dictionary::new();
        dict.set("Type", Object::Name(b"XObject".to_vec()));
        dict.set("Subtype", Object::Name(b"Image".to_vec()));
        dict.set("Width", width);
        dict.set("Height", height);
        dict.set("ColorSpace", Object::Name(color_space));
        dict.set("BitsPerComponent", bits);

        dict
    }

    async fn process_png(
        img: DynamicImage,
        bits: u16,
        mut dict: Dictionary,
        width: u32,
        height: u32,
    ) -> (Stream, ImageSize) {
        // NOTE: png 图片保存到 pdf 中时不保留其 alpha 通道。

        // png 是 rgba 通道时，位深可能是 10 位，pdf 只能使用 8 位或 16 位。
        // 从图片中提取出位深不是 8 或 16 时将其设置为 8。
        if bits != 8 && bits != 16 {
            dict.set("BitsPerComponent", 8);
        }

        let (w, h) = img.dimensions();
        let mut output = RgbImage::new(w, h);
        for (x, y, pixel) in img.pixels() {
            output.put_pixel(
                x,
                y,
                // pixel.map will iterate over the r, g, b, a values of the pixel
                pixel.to_rgb(),
            );
        }

        let mut img_object = Stream::new(dict, output.to_vec());
        // Ignore any compression error.
        let _ = img_object.compress();

        (img_object, ImageSize::from((width, height)))

        // NOTE: 如果上面的逻辑仍有问题，后续改用转换为 jpg 后递归完成。
        // output
        //     .save_with_format("output.jpg", ImageFormat::Jpeg)
        //     .unwrap();
        // return Self::new("output.jpg");
    }

    async fn image_from(buffer: Vec<u8>) -> Result<(Stream, ImageSize)> {
        let img = image::load_from_memory(buffer.as_ref())?;

        let (width, height) = img.dimensions();
        debug!("图片尺寸：width={}, height={}", width, height);

        // It looks like Adobe Illustrator uses a predictor offset of 2 bytes rather than 1 byte as
        // the PNG specification suggests. This seems to come from the fact that the PNG specification
        // doesn't allow 4-bit color images (only 8-bit and 16-bit color). With 1-bit, 2-bit and 4-bit
        // mono images there isn't the same problem because there's only one component.
        let bits = img.color().bits_per_pixel() / 3;
        debug!("图片色深为 {}", bits);

        let color_type = img.color();
        debug!("图片色彩类型为 {:?}", color_type);

        let color_space = Self::color_space(color_type);

        let mut dict = Self::set_image_dict(width, height, color_space, bits);

        let image_fmt = match image::guess_format(buffer.as_ref()) {
            Ok(format) => format,
            Err(err) => {
                warn!("获取图片格式失败，尝试直接返回图片对象：{}", err);

                let mut img_object = Stream::new(dict, img.into_bytes());
                // Ignore any compression error.
                let _ = img_object.compress();
                return Ok((img_object, ImageSize::from((width, height))));
            }
        };
        debug!("图片格式为 {:?}", image_fmt);

        match image_fmt {
            ImageFormat::Jpeg => {
                dict.set("Filter", Object::Name(b"DCTDecode".to_vec()));
                return Ok((Stream::new(dict, buffer), ImageSize::from((width, height))));
            }
            ImageFormat::Png => Ok(Self::process_png(img, bits, dict, width, height).await),
            _ => {
                let mut img_object = Stream::new(dict, img.into_bytes());
                // Ignore any compression error.
                let _ = img_object.compress();
                return Ok((img_object, ImageSize::from((width, height))));
            }
        }
    }
}

struct PDF {
    doc: Document,
    pages_id: ObjectId,
    page_size: PageSize,
}

impl PDF {
    pub fn new(page_type: PageType) -> PDF {
        let mut doc = Document::with_version("1.5");

        let pages_id = doc.new_object_id();

        let page_size = page_size(&page_type);

        debug!("创建一个新的 pdf 对象，页面类型 为 {:?}", page_type);

        PDF {
            doc,
            pages_id,
            page_size,
        }
    }

    fn add_blank_page(&mut self) -> ObjectId {
        // 需要有一个空 content 占位
        let content_id = self.doc.add_object(Stream::new(dictionary! {}, vec![]));

        let page_id = self.doc.add_object(dictionary! {
            "Type" => "Page",
            "Parent" => self.pages_id,
            "MediaBox" => vec![0.0.into(), 0.0.into(), self.page_size.width.into(), self.page_size.height.into()],
            "Contents" => content_id,
        });

        debug!("添加一个空页面 {:?}", page_id);

        page_id
    }

    fn scale(&self, image_size: &ImageSize) -> ImageSize {
        scale(image_size, &ImageSize::from(&self.page_size))
    }

    fn insert_image(
        &mut self,
        page_id: ObjectId,
        image_stream: Stream,
        position: Position,
        size: ImageSize,
    ) -> Result<()> {
        self.doc
            .insert_image(page_id, image_stream, position.into(), size.into())
    }

    fn insert_pages(&mut self, pages: Dictionary) {
        self.doc
            .objects
            .insert(self.pages_id, Object::Dictionary(pages));

        trace!("添加所有页面");
    }

    fn create_catalog(&mut self) {
        let catalog_id = self.doc.add_object(dictionary! {
            "Type" => "Catalog",
            "Pages" => self.pages_id,
        });
        trace!("已创建目录 {:?}", catalog_id);

        self.doc.trailer.set("Root", catalog_id);
        debug!("已添加目录 {:?}", catalog_id);

        self.doc.compress();
        trace!("文档已压缩");
    }

    fn save(&mut self, output: PathBuf) -> std::io::Result<()> {
        match self.doc.save(&output) {
            Ok(_) => {
                info!("已保存 pdf 文件：{:?}", output);
                Ok(())
            }
            Err(e) => {
                error!("保存文件时出错：{}", e);
                return Err(e);
            }
        }
    }
}

/// 把图片嵌入 pdf。
///
/// 使用并发添加图片，并发时需要保存图片顺序不能错乱。
pub async fn embedd_images_to_new_pdf(
    output: PathBuf,
    images: Vec<models::Image>,
) -> std::result::Result<(), String> {
    let mut pdf = PDF::new(PageType::A4);

    let mut tasks = Vec::with_capacity(images.len());

    for image in images.iter() {
        let page_id = pdf.add_blank_page();
        let path = image.path.clone();
        tasks.push((page_id, &image.path, tokio::spawn(ImageObject::new(path))));
    }

    let mut page_ids: Vec<Object> = Vec::with_capacity(images.len());

    for (page_id, ip, task) in tasks {
        let (stream, image_size) = task
            .await
            .map_err(|err| {
                error!("并发 join 时出错: {}", err);

                return err.to_string();
            })?
            .map_err(|e| e.to_string())?;

        let scaled = pdf.scale(&image_size);
        debug!("图片缩放尺寸 {:?} -> {:?}", image_size, scaled);

        let position = Position::from((
            (pdf.page_size.width as f32 - scaled.width as f32) / 2.0,
            (pdf.page_size.height as f32 - scaled.height as f32) / 2.0,
        ));
        debug!("图片在 pdf 中的坐标 {:?}", position);

        pdf.insert_image(page_id, stream, position, scaled)
            .map_err(|err| err.to_string())?;

        debug!("已向 pdf 插入图片：{:?}", ip);

        page_ids.push(page_id.into());
    }

    let pages = dictionary! {
        "Type" => "Pages",
        "Kids" => page_ids,
        "Count" => Object::Integer(images.len() as i64),
    };

    // 必需插入 pages
    pdf.insert_pages(pages);

    // 必需有目录对象，即使目录不显示
    pdf.create_catalog();

    match pdf.save(output) {
        Ok(()) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}
