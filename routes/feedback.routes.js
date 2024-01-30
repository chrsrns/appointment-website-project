const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const express = require("express");
const { findUserIdByAccessToken } = require("../routes/users.services");
const { createNotification } = require("./notifications.services");

const router = express.Router();

router.post("/add", async (req, res, next) => {
  try {
    const authorizationheader = req.headers.authorization;

    const token = authorizationheader.replace("Bearer ", "");
    const userId = findUserIdByAccessToken(token);
    console.log(userId);

    const data = req.body;
    data.userId = userId;
    data.rating = Number(data.rating);

    const feedback = await prisma.feedback.upsert({
      where: {
        userId: userId,
      },
      update: data,
      create: data,
    });

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    createNotification({
      title: `User ${user.login_username} left their feedback.`,
      message: `Rating: ${data.rating}`,
    });
    res.json(feedback);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while creating a medical record" });
  }
});

module.exports = router;
