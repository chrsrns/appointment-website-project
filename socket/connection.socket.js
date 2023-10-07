const { PrismaClient, Prisma } = require("@prisma/client");
const { findUserIdByAccessToken } = require("../users/users.services")
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const { findRefreshTokenById } = require("../auth/auth.services");

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
  io.use(async (socket, next) => {
    const accessToken = socket.handshake.auth.accessToken;
    const refreshToken = socket.handshake.auth.refreshToken
    const userId = findUserIdByAccessToken(accessToken)

    if (!userId)
      return next(new Error("invalid access token"))

    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const savedRefreshToken = await findRefreshTokenById(payload.jti);
    console.log(savedRefreshToken)

    if (!savedRefreshToken || savedRefreshToken.revoked === true) {
      return next(new Error('unauthorized session'));
    }

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
