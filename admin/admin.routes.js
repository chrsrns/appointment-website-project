const { isAuthenticated } = require("../middlewares");
// const { findUserById } = require("./users.services");
const bcrypt = require("bcrypt");

const { PrismaClient, Prisma, user_type, user_approval_type } = require("@prisma/client");
const prisma = new PrismaClient();

const express = require("express");
const { response } = require("..");
const router = express.Router();

router.get("/users", async (req, res, next) => {
  try {
    const user = await prisma.user.findMany({
      select: {
        id: true,
        fname: true,
        mname: true,
        lname: true,
        addr: true,
        cnum: true,
        emailaddr: true,
        bdate: true,
        rating: true,
        type: true,
        login_username: true
      }
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.get("/usertypes", async (req, res, next) => {
  try {
    const userTypesToReturn = (Object.keys(user_type)).map(
      (key, index) => {
        return user_type[key];
      },
    );

    res.json(userTypesToReturn);
  } catch (err) {
    next(err);
  }
});

router.post("/user", async (req, res, next) => {
  try {
    const user = req.body
    if (!user.login_password) {
      res.status(400) /// TODO maybe not effective as catch is changing status
      throw new Error(`🚫 Un-Authorized 🚫, \\nAuth Token: ${authorization}`);
    }

    user.login_password = bcrypt.hashSync(user.login_password, 12)
    user.approved = user_approval_type.Approved

    const usercreate = await prisma.user.create({
      data: user
    })
    res.status(200)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred when adding the user" });
  }

  return next();
})

router.put("/user/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const userFromBody = req.body
    if (userFromBody.login_password)
      userFromBody.login_password = bcrypt.hashSync(userFromBody.login_password, 12)
    const userToUpdate = await prisma.user.update({
      where: {
        id: id,
      },
      data: userFromBody
    });
    if (!userFromBody) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.status(200)
    return next()
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while modifying the user" });
  }
});

router.delete("/user/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const userToDelete = await prisma.user.delete({
      where: {
        id: id,
      },
    });
    if (!userToDelete) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(userToDelete);
    console.log(req.body)
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the user" });
  }
});

router.get("/announcements", async (req, res, next) => {
  try {
    const announcements = await prisma.announcement.findMany({
      select: {
        id: true,
        title: true,
        content: true
      }
    });
    res.json(announcements);
  } catch (err) {
    next(err);
  }
});

router.post("/announcement", async (req, res, next) => {
  try {
    const announcementcreate = await prisma.announcement.create({
      data: req.body
    })
    res.status(200)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred when adding the announcement" });
  }

  return next();
})

router.put("/announcement/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const announcementFromBody = req.body
    const announcementToUpdate = await prisma.announcement.update({
      where: {
        id: id,
      },
      data: announcementFromBody
    });
    if (!announcementFromBody) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }
    res.status(200)
    return next()
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while modifying the announcement" });
  }
});

router.delete("/announcement/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const announcementToDelete = await prisma.announcement.delete({
      where: {
        id: id,
      },
    });
    if (!announcementToDelete) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }
    res.json(announcementToDelete);
    console.log(req.body)
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the announcement" });
  }
});

module.exports = router;
