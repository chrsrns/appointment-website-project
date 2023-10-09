const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const express = require('express');
const { findUserIdByAccessToken } = require("../users/users.services");

const router = express.Router();

router.post("/add", async (req, res, next) => {
  try {
    const authorizationheader = req.headers.authorization;

    const token = authorizationheader.replace('Bearer ', '');
    const userId = findUserIdByAccessToken(token)
    console.log(userId)

    const data = req.body
    data.userId = userId
    data.rating = Number(data.rating)

    const feedback = await prisma.feedback.create({
      data: data,
    });

    res.json(feedback);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while creating a medical record" });

  }
})

module.exports = router
