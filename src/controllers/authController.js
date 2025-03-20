const authService = require("../services/authService");

exports.signUp = async (req, res, next) => {
  try {
    const user = await authService.userSignup(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const user = await authService.loginUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const data = req.body;
    const user = await authService.changeUserPassword({ data, userId });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};
