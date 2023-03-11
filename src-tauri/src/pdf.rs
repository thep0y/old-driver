use image::{ColorType, GenericImageView, ImageFormat, Pixel, RgbImage};
use lopdf::content::Content;
use lopdf::{dictionary, ObjectId};
use lopdf::{Dictionary, Document, Object, Result, Stream};
use std::fs::File;
use std::io::prelude::*;
use std::path::Path;

use crate::models;

struct ImageObject;
struct Size(u32, u32);

impl ImageObject {
    fn new<P: AsRef<Path>>(path: P) -> Result<(Stream, Size)> {
        let mut file = File::open(&path)?;
        let mut buffer = Vec::new();
        file.read_to_end(&mut buffer)?;

        Self::image_from(buffer)
    }

    fn image_from(buffer: Vec<u8>) -> Result<(Stream, Size)> {
        let img = image::load_from_memory(buffer.as_ref())?;

        let (width, height) = img.dimensions();

        // It looks like Adobe Illustrator uses a predictor offset of 2 bytes rather than 1 byte as
        // the PNG specification suggests. This seems to come from the fact that the PNG specification
        // doesn't allow 4-bit color images (only 8-bit and 16-bit color). With 1-bit, 2-bit and 4-bit
        // mono images there isn't the same problem because there's only one component.
        let bits = img.color().bits_per_pixel() / 3;

        let color_space = match img.color() {
            ColorType::L8 => b"DeviceGray".to_vec(),
            ColorType::La8 => b"DeviceGray".to_vec(),
            ColorType::Rgb8 => b"DeviceRGB".to_vec(),
            ColorType::Rgb16 => b"DeviceRGB".to_vec(),
            ColorType::La16 => b"DeviceN".to_vec(),
            ColorType::Rgba8 => b"DeviceRGB".to_vec(),
            ColorType::Rgba16 => b"DeviceN".to_vec(),
            _ => b"Indexed".to_vec(),
        };

        let mut dict = Dictionary::new();
        dict.set("Type", Object::Name(b"XObject".to_vec()));
        dict.set("Subtype", Object::Name(b"Image".to_vec()));
        dict.set("Width", width);
        dict.set("Height", height);
        dict.set("ColorSpace", Object::Name(color_space));
        dict.set("BitsPerComponent", bits);

        let image_fmt = match image::guess_format(buffer.as_ref()) {
            Ok(format) => format,
            Err(_) => {
                let mut img_object = Stream::new(dict, img.into_bytes());
                // Ignore any compression error.
                let _ = img_object.compress();
                return Ok((img_object, Size(width, height)));
            }
        };

        match image_fmt {
            ImageFormat::Jpeg => {
                dict.set("Filter", Object::Name(b"DCTDecode".to_vec()));
                return Ok((Stream::new(dict, buffer), Size(width, height)));
            }
            ImageFormat::Png => {
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
                return Ok((img_object, Size(width, height)));

                // NOTE: 如果上面的逻辑仍有问题，后续改用转换为 jpg 后递归完成。
                // output
                //     .save_with_format("output.jpg", ImageFormat::Jpeg)
                //     .unwrap();
                // return Self::new("output.jpg");
            }
            _ => {
                let mut img_object = Stream::new(dict, img.into_bytes());
                // Ignore any compression error.
                let _ = img_object.compress();
                return Ok((img_object, Size(width, height)));
            }
        }
    }
}

fn add_image_object(
    doc: &mut Document,
    page_type: models::PageType,
    image: &models::Image,
    pages_id: ObjectId,
) -> ObjectId {
    // 需要有一个空 content 占位
    let content_id = doc.add_object(Stream::new(dictionary! {}, vec![]));

    let page_size = page_type.size();
    // 插入图片 START
    let page_id = doc.add_object(dictionary! {
        "Type" => "Page",
        "Parent" => pages_id,
        "MediaBox" => vec![0.0.into(),0.0.into(),page_size.0.into(), page_size.1.into()],
        "Contents" => content_id,
    });

    let (image_stream, size) = ImageObject::new(&image.path).unwrap();

    let result = doc.insert_image(
        page_id,
        image_stream,
        (0., 0.0),
        (size.0 as f32, size.1 as f32),
    );
    if result.is_err() {
        println!("error: {:?}", result.err().unwrap().to_string());
    }
    // 插入图片 END

    page_id
}

/// 把图片嵌入 pdf
pub fn embedd_images_to_new_pdf<P: AsRef<Path>>(output: P, images: Vec<models::Image>) {
    let mut doc = Document::with_version("1.5");
    let pages_id = doc.new_object_id();

    // // 需要有一个空 content 占位
    // let content = Content { operations: [] };
    // let content_id = doc.add_object(Stream::new(dictionary! {}, content.encode().unwrap()));

    let mut page_ids: Vec<Object> = Vec::new();

    for img in images.iter() {
        let page_id = add_image_object(&mut doc, models::PageType::A4, img, pages_id);
        // 添加图片到 pages 的 Kids 列表
        page_ids.push(page_id.into());
    }

    let pages = dictionary! {
        "Type" => "Pages",
        "Kids" => page_ids,
        "Count" => Object::Integer(images.len().try_into().unwrap()),
    };
    // 必需插入 pages
    doc.objects.insert(pages_id, Object::Dictionary(pages));

    // 必需有目录对象，即使目录不显示
    let catalog_id = doc.add_object(dictionary! {
        "Type" => "Catalog",
        "Pages" => pages_id,
    });
    doc.trailer.set("Root", catalog_id);
    doc.compress();

    doc.save(output).unwrap();
}
