const { isAuthenticated } = require("../middlewares");
const { findUserIdByAccessToken } = require("../users/users.services")

const { PrismaClient, Prisma, schedule_state, user_type, repeat } = require("@prisma/client");
const prisma = new PrismaClient();

const express = require("express");
const router = express.Router();

router.get("/students", async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        type: user_type.Student
      },
      select: {
        id: true,
        fname: true,
        mname: true,
        lname: true,
      }
    })
    res.json(users);
  } catch (err) {
    next(err);
  }
});

router.get("/staff", async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            type: {
              not: user_type.Student
            },
          },
          {
            type: {
              not: user_type.Admin
            }
          }
        ]

      },
      select: {
        id: true,
        fname: true,
        mname: true,
        lname: true,
        type: true
      }
    })
    res.json(users);
  } catch (err) {
    next(err);
  }
});

router.get("/scheduletypes", async (req, res, next) => {
  try {
    const result = (Object.keys(schedule_state)).map(
      (key, index) => {
        return schedule_state[key];
      },
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/schedulerepeattypes", async (req, res, next) => {
  try {
    const result = (Object.keys(repeat)).map(
      (key, index) => {
        return repeat[key];
      },
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/schedules", async (req, res, next) => {
  try {
    const schedules = await prisma.schedule.findMany({
      select: {
        id: true,
        state: true,
        fromDate: true,
        toDate: true,
        title: true,
        desc: true,
        repeat: true
      }
    })
    res.json(schedules)
  } catch (err) {
    next(err)
  }
})

router.get("/schedules/by-user/:id", async (req, res, next) => {
  const { id } = req.params;

  try {
    const schedules = await prisma.schedule.findMany({
      where: {
        Users: {
          some: {
            id: id
          }
        }
      },
      select: {
        id: true,
        state: true,
        fromDate: true,
        toDate: true,
        title: true,
        desc: true,
        repeat: true
      }
    })
    res.json(schedules)
  } catch (err) {
    next(err)
  }
})

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
            mname: true,
            lname: true,
            type: true
          }
        }
      }
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
    const schedule = await prisma.schedule.update({
      where: {
        id: id,
      },
      data: req.body
    });
    if (!schedule) {
      res.status(404).json({ error: "Schedule not found" });
      return;
    }
    res.json(schedule);
    console.log(req.body)
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
    const schedule = await prisma.schedule.delete({
      where: {
        id: id,
      },
    });
    if (!schedule) {
      res.status(404).json({ error: "Schedule not found" });
      return;
    }
    res.json(schedule);
    console.log(req.body)
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the schedule" });
  }
});

router.post("/schedule", async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  const scheduleData = req.body

  const token = authorizationHeader.replace('Bearer ', '');
  const userId = findUserIdByAccessToken(token)

  scheduleData.Users = { connect: { id: userId } }
  try {
    const schedule = await prisma.schedule.create({
      data: req.body
    })
    res.json()
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred!" });
  }
})

router.get("/messages/by-schedule/:id", async (req, res, next) => {
  const { id } = req.params
  try {
    const schedules = await prisma.message.findMany({
      where: {
        Schedule: {
          is: {
            id: id
          }
        }
      },
      select: {
        id: true,
        createdAt: true,
        content: true,
        User: {
          select: {
            login_username: true,
            fname: true,
            mname: true,
            lname: true,
          }
        }

      }
    })
    res.json(schedules)
  } catch (err) {
    console.error(err)
    next(err)
  }
})

router.post("/message", async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  const messageData = req.body

  const token = authorizationHeader.replace('Bearer ', '');
  messageData.userId = findUserIdByAccessToken(token)

  console.log(messageData)
  try {
    const message = await prisma.message.create({
      data: req.body
    })
    res.json()
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred!" });
  }
})


module.exports = router;

