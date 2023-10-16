const bcrypt = require('bcrypt');
const { db } = require('../db');
const jwt = require('jsonwebtoken');

function findUserByUsername(login_username) {
  return db.user.findUnique({
    where: {
      login_username,
    },
  });

}

function findUserIdByAccessToken(accessToken) {
  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET)
    const userId = decoded.userId
    return userId
  } catch (err) { return null }
}

function findUserById(id) {
  return db.user.findUnique({
    where: {
      id,
    },
  });
}

function createUser(user) {
  user.login_password = bcrypt.hashSync(user.login_password, 12);
  // console.log(user)
  return db.user.create({
    data: user,
  });
}

function createUserByEmailAndPassword(user) {
  user.password = bcrypt.hashSync(user.password, 12);
  return db.user.create({
    data: user,
  });
}

module.exports = { findUserByUsername, findUserById, findUserIdByAccessToken, createUser };
