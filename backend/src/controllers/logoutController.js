const logoutController = (req, res) => {
  res.clearCookie('myDigitalToken', {
    httpOnly: true,
    secure: false,
    sameSite: 'strict'
  });
  return res.status(200).json({ message: 'Logout successful' });
};

export default logoutController;
