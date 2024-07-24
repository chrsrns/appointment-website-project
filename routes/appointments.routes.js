const { isAuthenticated } = require("../middlewares");
const { findUserIdByAccessToken } = require("../routes/users.services");

const {
  PrismaClient,
  Prisma,
  schedule_state,
  user_type,
  repeat,
  user_approval_type,
} = require("@prisma/client");
const prisma = new PrismaClient();

const express = require("express");
const router = express.Router();

const { getSocketInstance } = require("../socket");
const { createNotification } = require("../routes/notifications.services");

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
        lname: true,
      },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

router.get("/staff", async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            type: {
              not: user_type.Student,
            },
          },
          {
            type: {
              not: user_type.Admin,
            },
          },
          {
            approved: { not: user_approval_type.Archived },
          },
        ],
      },
      select: {
        id: true,
        fname: true,
        lname: true,
        type: true,
      },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

router.get("/scheduletypes", async (req, res, next) => {
  try {
    const result = Object.keys(schedule_state).map((key, index) => {
      return schedule_state[key];
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

router.get("/schedulerepeattypes", async (req, res, next) => {
  try {
    const authorizationheader = req.headers.authorization;

    const token = authorizationheader.replace("Bearer ", "");
    const userId = findUserIdByAccessToken(token);

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    const result = Object.keys(repeat).map((key, index) => {
      return repeat[key];
    });

    if (user.type === "Student") result.filter((e) => e === "Pending");

    res.json(result);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

/// TODO Add another route for only completed appointments, and PrintModal would use that.
router.get("/schedules", async (req, res, next) => {
  try {
    const authorizationheader = req.headers.authorization;

    const token = authorizationheader.replace("Bearer ", "");
    const userId = findUserIdByAccessToken(token);
    if (!userId) {
      res.status(400);
      throw new Error("No user with ID found");
    }
    console.log(userId);
    const schedules = await prisma.schedule.findMany({
      where: {
        AND: [
          {
            OR: [
              { Users: { some: { id: userId } } },
              { authorUserId: userId },
              { state: schedule_state.Available },
            ],
          },
          {
            OR: [
              { fromDate: { gte: new Date(Date.now()) } },
              { toDate: { gte: new Date(Date.now()) } },
              { repeat: { not: repeat.None } },
            ],
          },
        ],
      },
      select: {
        id: true,
        state: true,
        fromDate: true,
        toDate: true,
        title: true,
        desc: true,
        repeat: true,
        authorUserId: true,
        Users: {
          select: {
            id: true,
            fname: true,
            lname: true,
            type: true,
          },
        },
      },
    });
    console.log(schedules);
    res.json(schedules);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});

router.get("/schedules-summary", async (req, res, next) => {
  try {
    const authorizationheader = req.headers.authorization;

    const token = authorizationheader.replace("Bearer ", "");
    const userId = findUserIdByAccessToken(token);

    const schedules = await prisma.schedule.findMany({
      where: {
        AND: [
          {
            OR: [{ Users: { some: { id: userId } } }, { authorUserId: userId }],
          },
          { state: { not: schedule_state.Completed } },
          {
            OR: [
              { fromDate: { gte: new Date(Date.now()) } },
              { toDate: { gte: new Date(Date.now()) } },
              { repeat: { not: repeat.None } },
            ],
          },
        ],
      },
      select: {
        id: true,
        state: true,
        fromDate: true,
        toDate: true,
        title: true,
        repeat: true,
      },
    });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

router.get("/staff-availability", async (req, res, next) => {
  try {
    const schedules = await prisma.schedule.findMany({
      where: {
        AND: [
          {
            state: schedule_state.Available,
          },
          {
            NOT: [{ authoredBy: { type: user_type.Student } }],
          },
          {
            OR: [
              { fromDate: { gte: new Date(Date.now()) } },
              { toDate: { gte: new Date(Date.now()) } },
              { repeat: { not: repeat.None } },
            ],
          },
        ],
      },
      select: {
        id: true,
        state: true,
        fromDate: true,
        toDate: true,
        title: true,
        repeat: true,
        authoredBy: {
          select: {
            id: true,
            fname: true,
            lname: true,
          },
        },
      },
    });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

router.get("/schedules/by-user/:id", async (req, res, next) => {
  const { id } = req.params;

  try {
    const authorizationheader = req.headers.authorization;

    const token = authorizationheader.replace("Bearer ", "");
    const userId = findUserIdByAccessToken(token);

    const schedules = await prisma.schedule.findMany({
      where: {
        AND: [
          {
            OR: [{ Users: { some: { id: id } } }, { authorUserId: id }],
          },
          {
            OR: [
              { fromDate: { gte: new Date(Date.now()) } },
              { toDate: { gte: new Date(Date.now()) } },
              { repeat: { not: repeat.None } },
            ],
          },
          {
            OR: [
              { Users: { some: { id: userId } } },
              { state: schedule_state.Available },
            ],
          },
          { state: { not: schedule_state.Completed } },
        ],
      },
      select: {
        id: true,
        state: true,
        fromDate: true,
        toDate: true,
        title: true,
        desc: true,
        repeat: true,
        authorUserId: true,
        Users: {
          select: {
            id: true,
            fname: true,
            lname: true,
            type: true,
          },
        },
      },
    });
    console.log(schedules);
    res.json(schedules);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err.message });
  }
});

router.get("/schedule/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const schedule = await prisma.schedule.findUnique({
      where: {
        id: id,
      },
      include: {
        Users: {
          select: {
            id: true,
            fname: true,
            lname: true,
            type: true,
          },
        },
        authoredBy: true,
      },
    });
    if (!schedule) {
      res.status(404).json({ error: "Schedule not found" });
      return;
    }
    res.json(schedule);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the schedule" });
  }
});

router.put("/schedule/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const authorizationheader = req.headers.authorization;
    const token = authorizationheader.replace("Bearer ", "");
    const userId = findUserIdByAccessToken(token);

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    const schedule = await prisma.schedule.update({
      where: {
        id: id,
      },
      data: req.body,
      include: {
        Users: true,
        authoredBy: true,
      },
    });
    if (!schedule) {
      res.status(404).json({ error: "Schedule not found" });
      return;
    }
    const notifTargets = [...schedule.Users, schedule.authoredBy];
    createNotification({
      title: `Schedule Modified: ${schedule.title}`,
      message: `Schedule updated by ${user.lname}, ${user.fname}.`,
      users: notifTargets,
    });

    schedule.Users.forEach((element) => {
      getSocketInstance()
        .to(element.id)
        .emit("notify", {
          title: `Schedule Modified: ${schedule.title}`,
          message: `Schedule updated by ${user.lname}, ${user.fname}.`,
        });
    });

    getSocketInstance()
      .to(schedule.authorUserId)
      .emit("notify", {
        title: `Schedule Modified: ${schedule.title}`,
        message: `Schedule updated by ${user.lname}, ${user.fname}.`,
      });
    getSocketInstance().emit("update appointments");
    res.json(schedule);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while modifying the schedule" });
  }
});

router.delete("/schedule/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const authorizationheader = req.headers.authorization;
    const token = authorizationheader.replace("Bearer ", "");
    const userId = findUserIdByAccessToken(token);
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    const schedule = await prisma.schedule.delete({
      where: {
        id: id,
      },
      include: {
        Users: true,
        authoredBy: true,
      },
    });
    if (!schedule) {
      res.status(404).json({ error: "Schedule not found" });
      return;
    }

    const notifTargets = [...schedule.Users, schedule.authoredBy];
    createNotification({
      title: `Schedule Deleted: ${schedule.title}`,
      message: `Schedule deleted by ${user.lname}, ${user.fname}.`,
      users: notifTargets,
    });

    schedule.Users.forEach((element) => {
      getSocketInstance()
        .to(element.id)
        .emit("notify", {
          title: `Schedule Deleted: ${schedule.title}`,
          message: `Schedule deleted by ${user.lname}, ${user.fname}.`,
        });
    });
    getSocketInstance()
      .to(schedule.authorUserId)
      .emit("notify", {
        title: `Schedule Deleted: ${schedule.title}`,
        message: `Schedule deleted by ${user.lname}, ${user.fname}.`,
      });
    getSocketInstance().emit("update appointments");
    res.json(schedule);
    console.log(req.body);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the schedule" });
  }
});

router.post("/schedule", async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const scheduleData = req.body;

    const token = authorizationHeader.replace("Bearer ", "");
    const userId = findUserIdByAccessToken(token);
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    scheduleData.authoredBy = { connect: { id: userId } };
    const schedule = await prisma.schedule.create({
      data: scheduleData,
      include: {
        Users: true,
        authoredBy: true,
      },
    });

    const notifTargets = [...schedule.Users, schedule.authoredBy];
    createNotification({
      title: `Schedule Made: ${schedule.title}`,
      message: `Schedule created by ${user.lname}, ${user.fname}.`,
      users: notifTargets,
    });

    schedule.Users.forEach((element) => {
      getSocketInstance()
        .to(element.id)
        .emit("notify", {
          title: `Schedule Made: ${schedule.title}`,
          message: `Schedule created by ${user.lname}, ${user.fname}.`,
        });
    });
    getSocketInstance()
      .to(schedule.authorUserId)
      .emit("notify", {
        title: `Schedule Made: ${schedule.title}`,
        message: `Schedule created by ${user.lname}, ${user.fname}.`,
      });
    getSocketInstance().emit("update appointments");
    res.json();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred!" });
  }
});

router.get("/messages/by-schedule/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const schedules = await prisma.message.findMany({
      where: {
        Schedule: {
          is: {
            id: id,
          },
        },
      },
      select: {
        id: true,
        createdAt: true,
        content: true,
        User: {
          select: {
            login_username: true,
            fname: true,
            lname: true,
          },
        },
      },
    });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

router.post("/message", async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const messageData = req.body;

    const token = authorizationHeader.replace("Bearer ", "");
    messageData.userId = findUserIdByAccessToken(token);

    const user = await prisma.user.findUnique({
      where: {
        id: messageData.userId,
      },
    });

    const message = await prisma.message.create({
      data: messageData,
      include: {
        Schedule: {
          include: {
            Users: true,
            authoredBy: true,
          },
        },
      },
    });

    const notifTargets = [
      ...message.Schedule.Users,
      message.Schedule.authoredBy,
    ];
    createNotification({
      title: `New Message to Schedule: ${message.Schedule.title}`,
      message: `Message from ${user.lname}, ${user.fname}.`,
      users: notifTargets,
    });

    message.Schedule.Users.forEach((element) => {
      getSocketInstance()
        .to(element.id)
        .emit("notify", {
          title: `New Message to Schedule: ${message.Schedule.title}`,
          message: `Message from ${user.lname}, ${user.fname}.`,
        });
    });
    getSocketInstance()
      .to(message.Schedule.authorUserId)
      .emit("notify", {
        title: `New Message to Schedule: ${message.Schedule.title}`,
        message: `Message from ${user.lname}, ${user.fname}.`,
      });
    getSocketInstance().emit("update appointments");
    getSocketInstance().emit("update chats");
    res.status(200).json({ msg: "Message sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred!" });
  }
});

module.exports = router;
