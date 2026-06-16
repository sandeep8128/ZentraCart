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



req.user = decoded;



next();



}
catch(error){


return res.status(401).json({

message:"Invalid Token"

});


}


};



module.exports = authMiddleware;