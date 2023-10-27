const { isAuthenticated } = require("../middlewares");
const bcrypt = require("bcrypt");

const { PrismaClient, user_type, user_approval_type } = require("@prisma/client");
const prisma = new PrismaClient();

const express = require("express");
const router = express.Router();
const { createNotification } = require('../routes/notifications.services');

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
        type: true,
        login_username: true
      }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

router.get("/pendingusers", async (req, res, next) => {
  try {
    const user = await prisma.user.findMany({
      where: {
        approved: user_approval_type.Pending
      },
      select: {
        id: true,
        fname: true,
        mname: true,
        lname: true,
        addr: true,
        cnum: true,
        emailaddr: true,
        bdate: true,
        type: true,
        login_username: true
      }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

router.put("/pendinguser/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const userToUpdate = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        approved: req.body.approved
      }
    });
    if (!userToUpdate) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    createNotification({
      title: `User Registration ${req.body.approved}`,
      message: `User with username ${userToUpdate.login_username} registration was ${req.body.approved}`
    })

    res.status(200)
    return next()
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while modifying the user" });
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
    res.status(500).json({ msg: err.message });
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
    const authorizationheader = req.headers.authorization;

    const token = authorizationheader.replace('Bearer ', '');
    const userId = findUserIdByAccessToken(token)

    const userAdmin = await prisma.user.findUnique({
      where: {
        id: userId
      }
    })

    createNotification({
      title: `New User Added by Admin ${userAdmin.login_username} (${userAdmin.lname})`,
      message: `User with username ${user.login_username} added in the system`
    })
    res.status(200).json(usercreate)
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
    createNotification({
      title: `User Modified by Admin ${userAdmin.login_username} (${userAdmin.lname})`,
      message: `User with username ${user.login_username} modified in the system`
    })
    res.status(200)
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
    createNotification({
      title: `User Removed by Admin ${userAdmin.login_username} (${userAdmin.lname})`,
      message: `User with username ${user.login_username} removed from the system`
    })
    res.json(userToDelete);
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
    res.status(500).json({ msg: err.message });
  }
});

router.post("/announcement", async (req, res, next) => {
  try {
    const announcementcreate = await prisma.announcement.create({
      data: req.body
    })
    const authorizationheader = req.headers.authorization;
    const token = authorizationheader.replace('Bearer ', '');
    const userId = findUserIdByAccessToken(token)
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    })
    createNotification({
      title: `Announcement created by Admin ${user.login_username}: ${announcementcreate.title}`,
      message: `${announcementcreate.content}`
    })
    res.status(200)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred when adding the announcement" });
  }
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
    const authorizationheader = req.headers.authorization;
    const token = authorizationheader.replace('Bearer ', '');
    const userId = findUserIdByAccessToken(token)
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    })
    createNotification({
      title: `Announcement updated by Admin ${user.login_username}: ${announcementcreate.title}`,
      message: `${announcementcreate.content}`
    })
    res.json(announcementToUpdate)
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
    const authorizationheader = req.headers.authorization;
    const token = authorizationheader.replace('Bearer ', '');
    const userId = findUserIdByAccessToken(token)
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    })
    createNotification({
      title: `Announcement removed by Admin ${user.login_username}: ${announcementcreate.title}`,
      message: `${announcementcreate.content}`
    })
    res.json(announcementToDelete);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the announcement" });
  }
});

module.exports = router;
