const userService = require("../services/userService");

exports.getUser = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const user = await userService.getUserDetails(userId);

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

exports.updateUserDetails = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const data = req.body;
    const user = await userService.updateUser({ data, userId });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

exports.addAddress = async (req, res, next) => {
  try {
    const addressData = req.body;
    const userId = req.user?._id;
    const user = await userService.addUserAddress({ addressData, userId });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

exports.getAddress = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const user = await userService.getUserAddress(userId);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

exports.setAddressDefault = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { addressId } = req.body;
    const address = await userService.setDefaultAddress({ userId, addressId });
    res.status(201).json(address);
  } catch (error) {
    next(error);
  }
};
