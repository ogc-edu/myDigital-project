import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage} from 'multer-storage-cloudinary';
import multer from 'multer';
import path from 'path';

cloudinary.config({  //cld config to check
  cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
  }
)

const publicIdFormatter = (req, file) => {
  //path.format to format
  //path.parse -> dir, root, base, name, ext
  const username = req.user.username.toLowerCase();
  //file.originalname, mimetype, size, destination, filename, path, buffer
  const fileName = path.parse(file.originalname).name.toLowerCase();
  return `${username}/${fileName}`;
}

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'MyDigitalImages',   //parentFolder -> MyDigitalImages/${username}/${fileName}
  allowedFormats: ['jpg', 'png', 'jpeg'],
  public_id: (req, file) => {
    const username = req.user.username.toLowerCase();
    return `${username}/${file.originalname.toLowerCase()}`;
  },
  }
});

//according to documentation, multer-storage-cloudinary will attach req.file object to req,
//which contains metadata of uploaded image
export const imageFilter = multer({ storage }).single('image'); // Export as imageFilter and use single('image') middleware