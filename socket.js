/// Singleton to store a single instance of 

const socketIO = require('socket.io');

let ioInstance = null

function initializeSocket(httpServer) {
  try {
    if (!ioInstance) {
      ioInstance = socketIO(httpServer, {
        cors: {
          origin: ["https://woddafi.domcloud.io", "localhost"],
        }
      });
    }
  } catch (err) {
    logger.error(err)
  }
}

function getSocketInstance() {
  if (!ioInstance) {
    throw new Error('Socket.IO instance has not been initialized.');
  }
  return ioInstance;
}

module.exports = {
  initializeSocket,
  getSocketInstance,
};
