const bcrypt = require('bcrypt');
const { db } = require('../db');


function findUserByUsername(login_username) {
  return db.user.findUnique({
    where: {
      login_username,
    },
  });

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
  console.log(user)
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

module.exports = { findUserByUsername, findUserById, createUser };
