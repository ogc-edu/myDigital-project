import Image from '../models/Image.js';

//after succesful upload to cloudinary, need to insert into database
export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    // insert into database
    const newImage = await Image.create({
      image_url: req.file.path, // long-lived url, pass to user
      user_id: req.user.id,
      zip_id: req.body?.zip_id || null,
      public_id: req.file.originalname,
      image_type: req.file.mimetype,
      image_size: req.file.size,
    });

    res.status(201).json({ message: 'Image uploaded successfully', imageLink: newImage.image_url }); //only return if database insert successful, omit failed need to del from cloudinary
  } catch (err) {
    console.error('Error in upload controller:', err);
    next(err);
  }
};