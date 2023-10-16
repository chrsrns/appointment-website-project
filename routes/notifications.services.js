const bcrypt = require('bcrypt');
const { db } = require('../db');
const jwt = require('jsonwebtoken');
const { user_type } = require('@prisma/client');

const createNotification = async ({ title, message, users = [] }) => {
  try {
    const admins = await db.user.findMany({
      where: {
        type: user_type.Admin
      },
      select: {
        id: true
      }
    })

    const usersToAdd = (admins.length !== 0 || users.length !== 0) ? { connect: [...admins, ...users] } : {}
    const createNotification = await db.notifications.create({
      data: {
        title: title,
        message: message,
        usersToNotify: usersToAdd
      },
    });
    console.log(createNotification)

    return createNotification
  } catch (err) {
    console.error(err)
  }
}

module.exports = { createNotification }
