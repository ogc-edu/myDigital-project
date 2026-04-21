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
    image_url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true,
      },
    },
    public_id: { //image name
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'default_image',
      set(value) {
        this.setDataValue('public_id', value.trim());
      },
    },
    image_type:{
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue('image_type', value.trim().toLowerCase());
      },
    },
    image_name:{
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue('image_name', value.trim());
      },
    },
    image_width:{
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    image_length:{
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  },
  imageOptions,
);

export default Image;