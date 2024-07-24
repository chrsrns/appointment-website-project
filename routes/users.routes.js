const { isAuthenticated } = require("../middlewares");
const { findUserById } = require("./users.services");

const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();

const express = require("express");
const router = express.Router();

router.get("/profile", isAuthenticated, async (req, res, next) => {
  try {
    const { userId } = req.payload;
    const user = await findUserById(userId);
    delete user.login_password;
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

router.get("/announcements", async (req, res, next) => {
  try {
    const announcements = await prisma.announcement.findMany({
      select: {
        createdAt: true,
        title: true,
        content: true,
      },
    });
    res.json(announcements);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching announcements" });
  }
});

router.get("/appointments", async (req, res, next) => {
  try {
    // const appointments = awa
  } catch {}
});

router.get("/onlineusers", async (req, res, next) => {
  try {
    const user = await prisma.user.findMany({
      where: {
        isOnline: true,
      },
      select: {
        fname: true,
        lname: true,
        type: true,
      },
    });
    res.json(user);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching online users" });
  }
});

module.exports = router;
