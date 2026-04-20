import User from "../models/User.js";
import bcrypt from 'bcrypt';
import res from 'express/lib/response.js';

const registerController = async (req, res, next) => {
  try{
    const {email, username, password} = req.body;
    const userExist = await User.findOne({ where: { email } });
    if (userExist) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email,
      username,
      password: hashedPassword,
    })

    if(!newUser){
      return res.status(400).json({ error: 'Error register'}); //confirm what error msg to write
    }

    return res.status(201).json({ message: 'Registration successful'});

  }catch(err){
    console.error('Error in register controller:', err);
    next(err);
  }
}

export default registerController;