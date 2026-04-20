import sequelize from '../config/db.js';
import { DataTypes } from 'sequelize';

const zipOptions = {
  tableName: 'zips',
};

const Zip = sequelize.define('Zip', {
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
      model: 'users', //table Name
      key: 'id', // column name
    },
  },
  zip_name: {
      type: DataTypes.STRING,
      allowNull: false,
  },
  status: {
      type: DataTypes.STRING, //maybe not implemented
      allowNull: false,
      defaultValue: 'pending',
  },
  total_files: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
  },
  createdAt: {
      type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  }
}, zipOptions);

export default Zip;