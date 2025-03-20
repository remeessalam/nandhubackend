const orderService = require("../services/orderService");

//checkout section
exports.createOrder = async (req, res, next) => {
  try {
    console.log(req.user, req.user._id);
    const userId = req.user._id;
    const { isExpressDelivery } = req.body;

    const product = await orderService.createOrder({
      isExpressDelivery,
      userId,
    });
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const userId = req.user?._id;

    const user = await orderService.getUserorder({ userId });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

exports.getOneOrder = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const orderId = req.params?.id;
    const user = await orderService.getOneUserorder({ userId, orderId });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

exports.webhookTriggr = async (req, res, next) => {
  try {
    const product = await orderService.orderWebhooks(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

exports.verifyOrder = async (req, res, next) => {
  try {
    const user = await orderService.verifyPayment(req.body);
    res.status(201).json({
      user,
      message: "order verify Successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
