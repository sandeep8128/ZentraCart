let io;

const initSocket = (server) => {

    const { Server } = require("socket.io");

    io = new Server(server, {

        cors: {
            origin: "*"
        }

    });

    io.on("connection", (socket) => {

        console.log("User Connected:", socket.id);

        // Seller Room Join

        socket.on("joinSellerRoom", (sellerId) => {

            socket.join(sellerId);

            console.log(`Seller Joined Room: ${sellerId}`);

        });

        socket.on("disconnect", () => {

            console.log("User Disconnected:", socket.id);

        });

    });

};


const getIO = () => {

    if (!io) {

        throw new Error("Socket.io not initialized");

    }

    return io;

};

module.exports = {
    initSocket,
    getIO
};