const addressModel = require("../models/addressModel");
const userModel = require("../models/userModel");

// Get product using id
exports.getUserDetails = async (data) => {
  const user = await userModel.findById(data);
  if (!user) {
    return { message: "User not found" };
  }

  return { success: true, user };
};

exports.updateUser = async ({ data, userId }) => {
  const { fullName, email } = data;

  if (!fullName && !email) {
    return { message: "Name or email is required for update" };
  }

  // Find and update user details
  const user = await userModel.findById(userId);
  if (!user) {
    return { message: "User not found" };
  }

  if (fullName) user.fullName = fullName;
  if (email) user.email = email;

  await user.save();

  return { success: true, message: "Profile updated successfully", user };
};

exports.addUserAddress = async ({ addressData, userId }) => {
  let address = await addressModel.findOne({ userId });

  if (!address) {
    address = new addressModel({
      userId,
      addresses: [{ ...addressData, isDefault: true }],
    });
  } else {
    address.addresses.push(addressData);
  }

  await address.save();
  return { success: true, message: "Address added successfully", address };
};

exports.getUserAddress = async (userId) => {
  let address = await addressModel.findOne({ userId });

  if (!address) return { message: "Address not found" };

  return { success: true, message: "Address Fetched successfully", address };
};

exports.setDefaultAddress = async ({ userId, addressId }) => {
  try {
    const address = await addressModel.findOne({ userId });

    if (!address) {
      return { message: "Address not found for user" };
    }

    // Check if the provided addressId exists in the user addresses
    const addressIndex = address.addresses.findIndex((addr) =>
      addr._id.equals(addressId)
    );

    if (addressIndex === -1) {
      return { message: "Address not found" };
    }

    address.addresses.forEach((addr) => (addr.isDefault = false));

    address.addresses[addressIndex].isDefault = true;

    await address.save();

    return {
      success: true,
      message: "Default address updated successfully",
      address,
    };
  } catch (error) {
    console.error("Error updating default address:", error);
    return { message: "Error updating default address", error };
  }
};
