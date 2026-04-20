import User from '../models/User.js';
import Image from '../models/Image.js';

const userImage = async (req, res, next) => {
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
export default userImage;