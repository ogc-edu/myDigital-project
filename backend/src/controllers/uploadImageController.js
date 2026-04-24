import Image from '../models/Image.js';
import * as zip from "@zip.js/zip.js"
import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';
import path from 'path';

//upload to cloudinary, helper function
export const streamUpload = (buffer, req, originalName) => {
    return new Promise((resolve, reject) => {
      const username = req.user.username.toLowerCase();
      const fileName = path.parse(originalName).name.toLowerCase();
      const publicId = `${username}/${fileName}`;
      
      const uploadStream = cloudinary.uploader.upload_stream(   //because data in buffer, not file
        {
          folder: "MyDigital",
          public_id: publicId,    //format public id
          type: 'authenticated',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      //binary data -> buffer [data transformation]
      //pipe to send through chunks, Buffer.from ensure always Uint8Array
      Readable.from(Buffer.from(buffer)).pipe(uploadStream);
    });
  }

//extract from zip file, upload to cloudinary, update database
export const uploadImage = async(req, res, next) => {
  try{
    if(!req.file){ return res.status(400).json({ error: 'No file uploaded' });} //if no file uploaded

    const isBulk = ['application/zip', 'application/x-zip-compressed'].includes(req.file.mimetype);
    const isSingle = ['image/jpeg', 'image/jpg', 'image/png'].includes(req.file.mimetype);

    if(!isBulk && !isSingle ){ return res.status(400).json({ error: 'Invalid file type. Only zip files and images are allowed.' });}

    if(isBulk){
      const reader = new zip.ZipReader(new zip.Uint8ArrayReader(new Uint8Array(req.file.buffer)));  //convert from buffer binary to JS ArrayType
      const entries = await reader.getEntries();    //browse central directory to get array of Entry objects(filename, size, offset)
      const uploadedImages = [];

      //filter for image files
      const imageEntries = entries.filter(entry => !entry.directory && entry.filename.match(/\.(jpg|jpeg|png)$/i));

      // if (imageEntries.length === 0) {
      //   return res.status(400).json({
      //     error: 'Invalid ZIP content',
      //     message: 'No image files found in ZIP uploaded'
      //   });
      // }

      for (const entry of imageEntries) {
        const imageData = await entry.getData(new zip.Uint8ArrayWriter());
        const result = await streamUpload(imageData, req, entry.filename);

        await Image.create({
          user_id: req.user.id,
          public_id: result.public_id,
          image_url: result.secure_url,
          image_type: result.format,
          image_width: result.width,
          image_length: result.height, // FIX: Use image_length instead of image_height to match model
          image_name: result.public_id.split('/').pop(),
        });
        
        uploadedImages.push(result.secure_url);
      }

      await reader.close();

      return res.status(201).json({
        message: 'ZIP processed successfully',
        image_url: uploadedImages
      });
    }
    if(isSingle){
      // Handle Single Image Upload
      const result = await streamUpload(req.file.buffer, req, req.file.originalname);

      const newImage = await Image.create({
        user_id: req.user.id,
        public_id: result.public_id,
        image_url: result.secure_url,
        image_type: result.format,
        image_width: result.width,
        image_length: result.height, // FIX: Use image_length instead of image_height to match model
        image_name: result.public_id.split('/').pop(),
      })

      return res.status(201).json({
        message: 'Image uploaded successfully',
        images: newImage
      });
    }
  }catch(err){
    next(err);
  }
}



