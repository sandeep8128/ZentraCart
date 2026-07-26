const jwt = require("jsonwebtoken");


const authMiddleware = (req,res,next)=>{


try{


const token = req.headers.authorization;



if(!token){

return res.status(401).json({

message:"No Token Provided"

});

}


// Bearer token remove karna

const actualToken = token.split(" ")[1];



const decoded = jwt.verify(
  actualToken,
  process.env.JWT_SECRET
);

console.log("===== AUTH =====");
console.log("Token:", actualToken);
console.log("Decoded:", decoded);

req.user = decoded;

next();



}
catch(error){


return res.status(401).json({

message:"Invalid Token"

});


}


};
// ==========================
// UPDATE PROFILE
// ==========================

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


module.exports = authMiddleware;