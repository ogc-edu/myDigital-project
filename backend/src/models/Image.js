import sequelize from '../config/db.js';
import { DataTypes } from 'sequelize';

const imageOptions = {
  tableName: 'images'
}

const Image = sequelize.define(
  'Image',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    zip_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'zips',
        key: 'id',
      },
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    public_id: { //image name
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'default_image',
    },
    image_type:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    image_size:{
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  },
  imageOptions,
);

export default Image;