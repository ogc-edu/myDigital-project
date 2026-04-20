import sequelize from '../config/db.js';
import { DataTypes } from 'sequelize';

const userOptions = {
  tableName: 'users',    //table name is users
  hooks: {
    beforeValidate: (user, options) => {
      if(user.username){
        user.zip_root = user.username.toLowerCase();
        user.image_root = user.username.toLowerCase();
      }
    }
  }
}

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,  //validator includes email validator
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  zip_root: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'default_zip',
  },
  image_root: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'default_image',
  }
}, userOptions);

export default User;