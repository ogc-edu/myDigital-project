import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import res from 'express/lib/response.js';

const loginController = async (req, res, next) => {
  try{
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({where: { email }} );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ token });

  }catch(err){
    console.error('Error in login controller:', err);
    next(err);
  }
};

export default loginController;

/*
{
 id: user.id,
  username: user.username,
}
 */