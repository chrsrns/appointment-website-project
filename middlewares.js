const jwt = require('jsonwebtoken');

// import { PrismaClient, Prisma } from "@prisma/client";
// const prisma = new PrismaClient();

function isAuthenticated(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization) {
    res.status(401);
    throw new Error(`🚫 Un-Authorized 🚫, \nAuth Token: ${authorization}`);
  }

  try {
    const token = authorization.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.payload = payload;
  } catch (err) {
    res.status(401);
    if (err.name === 'TokenExpiredError') {
      throw new Error(err.name);
    }
    throw new Error(`🚫 Un-Authorized 🚫, \nAuth Token: ${token}`);
  }

  return next();
}

function isAdminAuthenticated(req, res, next) {
}

module.exports = {
  // ... other modules
  isAuthenticated
}

