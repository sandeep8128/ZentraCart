const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../config/nodemailer");
const crypto = require("crypto");


// REGISTER USER

exports.register = async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;


        const existingUser = await User.findOne({ email });


        if(existingUser){

            return res.status(400).json({
                message:"User already exists"
            });

        }


        const hashedPassword = await bcrypt.hash(password,10);


        const user = await User.create({

            name,
            email,
            password:hashedPassword

        });


        res.status(201).json({

            message:"User Registered Successfully",

            user:{
                name:user.name,
                email:user.email,
                role:user.role
            }

        });


    }
    catch(error){

        res.status(500).json({

            message:error.message

        });

    }

};




// LOGIN USER


exports.login = async(req,res)=>{


    try{


        const {
            email,
            password
        } = req.body;



        const user = await User.findOne({email});



        if(!user){

            return res.status(404).json({

                message:"User not found"

            });

        }



        const isMatch = await bcrypt.compare(
            password,
            user.password
        );



        if(!isMatch){

            return res.status(400).json({

                message:"Invalid Password"

            });

        }



        const token = jwt.sign(

            {
                id:user._id,
                role:user.role
            },

            process.env.JWT_SECRET,

            {
                expiresIn:"1d"
            }

        );



        res.json({

            message:"Login Successful",

            token,

            user:{

                name:user.name,
                email:user.email,
                role:user.role

            }

        });



    }
    catch(error){


        res.status(500).json({

            message:error.message

        });


    }


};

// ==========================
// CHANGE PASSWORD
// ==========================

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Current Password Incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    user.password = hashedPassword;

    await user.save();

    res.json({
      message: "Password Updated Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name },
      { new: true }
    );

    res.json({
      message: "Profile Updated Successfully",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.becomeSeller = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role === "seller") {
      return res.status(400).json({
        message: "Already a Seller",
      });
    }

    user.role = "seller";

    await user.save();

    res.json({
      message: "Seller Account Activated",
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// forget password 

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const resetToken = crypto
      .randomBytes(32)
      .toString("hex");

    user.resetPasswordToken = resetToken;

    user.resetPasswordExpire =
      Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetUrl =
      `http://localhost:5173/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset</h2>
        <p>Click below link to reset password:</p>

        <a href="${resetUrl}">
          Reset Password
        </a>

        <p>This link expires in 15 minutes.</p>
      `,
    });

    res.json({
      message: "Reset link sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//Reset password

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;

    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,

      resetPasswordExpire: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or Expired Token",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({
      message: "Password Reset Successful",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};