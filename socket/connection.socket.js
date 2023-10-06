const { PrismaClient, Prisma } = require("@prisma/client");
const { findUserIdByAccessToken } = require("../users/users.services")
const prisma = new PrismaClient();

class Connection {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;

    this.setOnlineStatus(socket.userId, true)

    socket.on('disconnect', () => this.disconnect());
    socket.on('connect_error', (err) => {
      console.log(`connect_error due to ${err.message}`);
    });
  }

  disconnect() {
    console.log('🔥: A user disconnected');

    this.setOnlineStatus(this.socket.userId, false)

  }
  async setOnlineStatus(userId, status) {
    try {
      const user = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          isOnline: status
        }
      });
      if (!user) {
        console.error("User not found")
        return;
      }
      this.io.emit("online users changed")
    } catch (error) {
      console.error(error);
    }
  }
}

function connect(io) {
  io.use((socket, next) => {
    const accessToken = socket.handshake.auth.accessToken;
    const userId = findUserIdByAccessToken(accessToken)

    if (!userId)
      return next(new Error("invalid access token"))

    socket.userId = userId
    next()
  })
  io.on('connect', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);
    new Connection(io, socket)
    console.log(`userId: ${socket.userId}`)
    socket.join(socket.userId)

  });
}
module.exports = connect;
