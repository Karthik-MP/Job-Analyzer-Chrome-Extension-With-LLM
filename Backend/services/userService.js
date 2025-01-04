const User = require("../models/User");
const jwt = require("jsonwebtoken");

class UserService {
  static generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET || "Console.log", {
      expiresIn: "24h",
    });
  }

  static async createUser(userData) {
    try {
      // Check if user exists
      const email = userData?.email 
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error("User already exists");
      }
      const user = await User.create(userData);
      const token = this.generateToken(user._id);
      return { user, token };
    } catch (error) {
      console.log(error)
      throw new Error(error.message);
    }
  }

  static async loginUser(email, password) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("User not found");
      }

      if (!user || !(await user.comparePassword(password))) {
        throw new Error("Invalid email or password");
      }
      const token = this.generateToken(user._id);
      return { user, token };
    } catch (error) {
      console.error(error.message);
      throw new Error(error.message);
    }
  }

  static async updateUserProfile(userId, updateData) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = UserService;
