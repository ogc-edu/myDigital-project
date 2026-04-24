import User from '../models/User.js';
import Image from '../models/Image.js';
import cloudinary from '../config/cloudinary.js';

//return all images of user
const getAllImage = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const images = await Image.findAll({ where: { user_id } });

        res.status(200).json({
            images: images,
        });
    } catch (error) {
        next(error);
    }
};

const getAuthenticateUrl = async (req, res, next) => {
    const user_id = req.user.id;
    const images = await Image.findAll({ where: { user_id } });

    try{
        const imagesWithSecureUrl = images.map((img) => {
            const baseConfig = {
                type: 'authenticated',
                sign_url: true,
                secure: true,
            };

            let thumbnails = {};

            if(img.image_width >= 128 && img.image_length >= 128){
                thumbnails.thumb32 = cloudinary.url(img.public_id, {
                    ...baseConfig,
                    format: img.image_type,
                    transformation: [{ width: 32, crop: 'scale'}]
                });
                thumbnails.thumb64 = cloudinary.url(img.public_id, {
                    ...baseConfig,
                    format: img.image_type,
                    transformation: [{ width: 64, crop: 'scale' }]
                });
            } else{
                const originalUrl = cloudinary.url(img.public_id, { ...baseConfig, format: img.image_type });
                thumbnails.thumb32 = originalUrl;
                thumbnails.thumb64 = originalUrl;
            }
            return {
                id: img.id,
                image_name: img.image_name,
                original_url: cloudinary.url(img.public_id, { ...baseConfig, format: img.image_type }),        //return full size id
                ...thumbnails,
            };
        })
        res.status(200).json({
            images: imagesWithSecureUrl,
        });
    }catch(err)
    {
        next(err);
    }
}

export { getAuthenticateUrl, getAllImage };