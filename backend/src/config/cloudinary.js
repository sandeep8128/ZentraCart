const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

cloudinary.api.ping()
.then(result => console.log("CLOUDINARY OK =>", result))
.catch(err => console.log("CLOUDINARY ERROR =>", err.message));

console.log("SECRET EXISTS =>", !!process.env.CLOUDINARY_API_SECRET);

module.exports = cloudinary;