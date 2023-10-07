const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const express = require('express');
const { findUserIdByAccessToken } = require("../users/users.services");

const router = express.Router();

router.get("/notifications", async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  const token = authorizationHeader.replace('Bearer ', '');
  const userId = findUserIdByAccessToken(token)

  try {
    const notificationsToGet = await prisma.notifications.findMany({
      where: {
        usersToNotify: {
          some: {
            id: userId
          }
        }
      }

    })
    res.json(notificationsToGet)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred!" });
  }
});

router.put("/removeFromUsersToNotify/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader.replace('Bearer ', '');
    const userId = findUserIdByAccessToken(token)

    const notification = await prisma.notifications.update({
      where: {
        id: id,
      },
      data: {
        usersToNotify: {
          disconnect: { id: userId }
        }
      }
    });
    if (!notification) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }
    res.json(notification);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while removing from notification" });

  }
})

module.exports = router
