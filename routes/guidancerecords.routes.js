const {
  PrismaClient,
  user_type,
  user_approval_type,
} = require("@prisma/client");
const prisma = new PrismaClient();
const express = require("express");
const { isAuthenticated } = require("../middlewares");
const { findUserIdByAccessToken } = require("../routes/users.services");

const router = express.Router();

router.get("/records", async (req, res, next) => {
  try {
    const authorizationheader = req.headers.authorization;

    const token = authorizationheader.replace("Bearer ", "");
    const userId = findUserIdByAccessToken(token);
    const medRecordsToGet = await prisma.guidanceRecord.findMany({
      where: {
        userId: userId,
      },
    });
    res.json(medRecordsToGet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "an error occurred!" });
  }
});

router.get("/records-by/:id", isAuthenticated, async (req, res, next) => {
  try {
    const { id } = req.params;
    const authorizationheader = req.headers.authorization;

    const token = authorizationheader.replace("Bearer ", "");
    const userId = findUserIdByAccessToken(token);

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        approved: { not: user_approval_type.Archived },
      },
      select: {
        type: true,
      },
    });
    if (user.type == user_type.Student) {
      res.sendStatus(401);
      return;
    }

    const medRecordsToGet = await prisma.guidanceRecord.findMany({
      where: {
        userId: id,
      },
    });
    res.json(medRecordsToGet);
  } catch (err) {
    console.error(err);
    res.json({ error: err.message });
  }
});

router.get("/students", async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        type: user_type.Student,
        approved: { not: user_approval_type.Archived },
      },
      select: {
        id: true,
        fname: true,
        mname: true,
        lname: true,
        type: true,
      },
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "an error occurred!" });
  }
});

router.post("/record", async (req, res, next) => {
  try {
    const data = req.body;

    const record = await prisma.guidanceRecord.create({
      data: data,
      include: {
        user: true,
      },
    });
    const authorizationheader = req.headers.authorization;
    const token = authorizationheader.replace("Bearer ", "");
    const userId = findUserIdByAccessToken(token);
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    createNotification({
      title: `Guidance Record Added`,
      message: `Guidance Record created by ${user.login_username} for ${record.user.login_username}`,
      users: [record.user],
    });
    getSocketInstance()
      .to(record.userId)
      .emit("notify", {
        title: `Guidance Record Added`,
        message: `Guidance Record created by ${user.login_username} for ${record.user.login_username}`,
      });
    getSocketInstance().emit("update guidance records");
    res.json(record);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while creating a guidance record" });
  }
});

module.exports = router;
