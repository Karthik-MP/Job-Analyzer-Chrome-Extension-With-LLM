const UserService = require('../services/userService');
const bcrypt = require('bcrypt');

class UserController {
  static async signup(req, res) {
    try {
      console.log("Requested Initiated", req.body)
      const { email, password, phoneNumber, country, major, degree, university, startDate, endDate, visaStatus } = req.body;
      // const hashedPassword = await bcrypt.hash(password, 10);
      // console.log("hashedPassword",hashedPassword)
      const { user, token } = await UserService.createUser({
        email, password, phoneNumber, country, major, degree, university, startDate, endDate, visaStatus
      });


      res.status(201).json({
        success: true,
        token,
        user: {
          email : user.email,
          phoneNumber : user.phoneNumber,
          country : user.country,
          major : user.major,
          degree : user.degree,
          university : user.university,
          startDate : user.startDate,
          endDate : user.endDate,
          visaStatus : user.visaStatus
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async login(req, res) {
    try {
      console.log("Requested Initiated", req.body)
      const { email, password } = req.body;
      const { user, token } = await UserService.loginUser(email, password);

      res.json({
        success: true,
        token,
        user: {
          email: user.email,
          education: user.education,
          visaStatus: user.visaStatus,
          degree: user.degree,
          major: user.major,
          country: user.country
        }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  static async updateProfile(req, res) {
    try {
      const user = await UserService.updateUserProfile(req.user.id, req.body);
      res.json({
        success: true,
        user: {
          email: user.email,
          education: user.education,
          visaStatus: user.visaStatus
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = UserController;