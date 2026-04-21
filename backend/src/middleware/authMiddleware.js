import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = (req.cookies && req.cookies.myDigitalToken) || (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);

  if (!token) return res.status(401).json({ message: 'Unauthorized' }); //no token

  try {
    //verify token
    const legitData = jwt.verify(token, process.env.JWT_SECRET); //extracted from JWT
    req.user = legitData;
    next();
  } catch (error) {
    //verification of token failed
    res.status(403).json({ message: 'Invalid Token' });
  }
};

