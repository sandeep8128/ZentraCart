const app = require("./app");
const connectDB = require("./config/db");
require("./config/cloudinary");

require("dotenv").config();

const http = require("http");

const { initSocket } = require("./socket/socket");

connectDB();

const PORT = process.env.PORT || 3200;

// Create HTTP Server

const server = http.createServer(app);

// Initialize Socket.io

initSocket(server);

// Start Server

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
