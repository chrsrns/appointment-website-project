const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const express = require('express');
const { findUserIdByAccessToken } = require("../routes/users.services");

const router = express.Router();

router.get("/records", async (req, res, next) => {
  try {
    const authorizationheader = req.headers.authorization;

    const token = authorizationheader.replace('Bearer ', '');
    const userId = findUserIdByAccessToken(token)
    const medRecordsToGet = await prisma.medicalRecord.findMany({
      where: {
        userId: userId
      }
    })
    res.json(medRecordsToGet)
  } catch (err) {
    // console.error(err);
    res.status(500).json({ error: "an error occurred!" });
  }
});

router.get("/users", async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fname: true,
        mname: true,
        lname: true,
        type: true
      }
    })
    res.json(users)
  } catch (err) {
    // console.error(err);
    res.status(500).json({ error: "an error occurred!" });
  }
});

router.post("/record", async (req, res, next) => {
  try {
    const data = req.body

    const record = await prisma.medicalRecord.create({
      data: data,
      include: {
        user: true
      }
    });

    res.json(record);
  } catch (error) {
    // console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while creating a medical record" });

  }
})

module.exports = router
