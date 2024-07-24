const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { generateTokens } = require("../jwt");
const bcrypt = require("bcrypt");
const {
  addRefreshTokenToWhitelist,
  findRefreshTokenById,
  deleteRefreshToken,
  revokeTokens,
  verifySession,
} = require("./auth.services");
const jwt = require("jsonwebtoken");

const {
  PrismaClient,
  user_type,
  user_approval_type,
} = require("@prisma/client");
const prisma = new PrismaClient();

const router = express.Router();
const {
  findUserByUsername,
  findUserById,
  findUserByEmail,
  createUser,
} = require("../routes/users.services");

const { hashToken } = require("../hashTokens");
const { createNotification } = require("../routes/notifications.services");
const { OAuth2Client } = require("google-auth-library");

const axios = require("axios");

require("dotenv").config();

// TODO Lang Constant. Move to separate file
const emailheader = "Scheduler Project by Christian Aranas";

router.post("/register", async (req, res, next) => {
  try {
    const { fname, lname, login_username, type } = req.body;
    //
    console.log(req.body);
    if (!login_username || !fname || !lname || !type) {
      res.status(400);
      throw new Error(`You must provide an all required fields.`);
    }

    const existingUser = await findUserByUsername(login_username);

    if (existingUser) {
      res.status(400);
      throw new Error("Username already in use");
    }

    if (type == user_type.Admin) {
      res.status(400);
      throw new Error("Unauthorized");
    }

    const user = await createUser(req.body);
    createNotification({
      title: "New User Registered",
      message: `User with username ${user.login_username} registered in the system`,
    });

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    // TODO Improve error handling
    res.status(500).json({ msg: err.message });
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { login_username } = req.body;
    if (!login_username) {
      res.status(400);
      throw new Error("You must provide your username.");
    }

    const existingUser = await findUserByUsername(login_username);

    if (!existingUser) {
      res.status(403);
      throw new Error("Invalid username used.");
    }

    switch (existingUser.approved) {
      case user_approval_type.Pending:
        res.status(403);
        throw new Error(
          "Approval of this account is still pending. Please wait for it to be approved by an admin or contact the admin.",
        );

      case user_approval_type.Unapproved:
        res.status(403);
        throw new Error(
          "This account's registration was rejected. Contact the admin for details.",
        );

      default:
        break;
    }

    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(existingUser, jti);
    await addRefreshTokenToWhitelist({
      jti,
      refreshToken,
      userId: existingUser.id,
    });

    createNotification({
      title: "User Logged In",
      message: `User with username ${existingUser.login_username} logged in to the system`,
    });

    res.status(200).json({
      accessToken,
      refreshToken,
      type: existingUser.type,
      id: existingUser.id,
      login_username: existingUser.login_username,
      approved: existingUser.approved,
    });
  } catch (err) {
    res.json({ msg: err.message });
  }
});

router.post("/refreshToken", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400);
      throw new Error("Missing refresh token.");
    }
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const savedRefreshToken = await findRefreshTokenById(payload.jti);

    if (!savedRefreshToken || savedRefreshToken.revoked === true) {
      res.status(401);
      throw new Error("Unauthorized");
    }

    const hashedToken = hashToken(refreshToken);
    if (hashedToken !== savedRefreshToken.hashedToken) {
      res.status(401);
      throw new Error("Unauthorized");
    }

    const user = await findUserById(payload.userId);
    if (!user) {
      res.status(401);
      throw new Error("Unauthorized");
    }

    await deleteRefreshToken(savedRefreshToken.id);
    const jti = uuidv4();
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user,
      jti,
    );
    await addRefreshTokenToWhitelist({
      jti,
      refreshToken: newRefreshToken,
      userId: user.id,
    });

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

router.get("/usertypes", async (req, res, next) => {
  try {
    const userTypesToReturn = Object.keys(user_type)
      .filter((key) => key != "Admin")
      .map((key, index) => {
        return user_type[key];
      });

    res.json(userTypesToReturn);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// This endpoint is only for demo purpose.
// Move this logic where you need to revoke the tokens( for ex, on password reset)
router.post("/revokeRefreshTokens", async (req, res, next) => {
  try {
    const { userId } = req.body;
    await revokeTokens(userId);
    res.json({ message: `Tokens revoked for user with id #${userId}` });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

router.get("/decodeoauth", async (req, res, next) => {
  try {
    const authorizationheader = req.headers.authorization;
    const token = authorizationheader.replace("Bearer ", "");
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const decoded = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    console.log("Decoded: ", decoded);
    res.json(decoded);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred." });
  }
});

// This is a copy of emailfromgoogle(deleted) BUT with the emailing removed AND also sending the OTP as a response. The OTP will be used by the client UI to verify if they really did go through the OAuth to enter the email and not just used the browser's Inspector to bypass the disabled form input.
router.get("/saveemailfromgoogle", async (req, res, next) => {
  try {
    const authorizationheader = req.headers.authorization;
    const token = authorizationheader.replace("Bearer ", "");
    const profile = await axios
      .get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      )
      .then((res) => res.data);
    console.log(profile);

    const email = profile.email;
    if (await findUserByEmail(email)) {
      console.log(await findUserByEmail(email));
      res.status(400);
      throw new Error(
        "Email is already registered. If you think this is a mistake, please contact the developers.",
      );
    }
    const wherequery = {
      where: {
        emailaddr: email,
      },
    };

    const randomOtp = Math.floor(Math.random() * 900000 + 100000);
    let otp = await prisma.otp.findUnique(wherequery);
    if (otp) await prisma.otp.delete(wherequery);
    otp = await prisma.otp.create({
      data: {
        emailaddr: email,
        otp: randomOtp,
      },
    });
    res.json({ status: "Email sent", email: email, verif: randomOtp });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/googlelogin", async (req, res, next) => {
  try {
    const authorizationheader = req.headers.authorization;
    const token = authorizationheader.replace("Bearer ", "");

    const profileReq = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      },
    );
    const profile = await profileReq.data;

    const email = profile.email;

    if (!email) {
      res.status(400);
      throw new Error("No email provided");
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        login_username: email,
      },
    });

    if (!existingUser) {
      res.status(403);
      throw new Error(
        "Invalid login credentials. Make sure that the email of your Google account matches your registered username.",
      );
    }

    switch (existingUser.approved) {
      case user_approval_type.Pending:
        res.status(403);
        throw new Error(
          "Approval of this account is still pending. Please wait for it to be approved by an admin or contact the admin.",
        );

      case user_approval_type.Unapproved:
        res.status(403);
        throw new Error(
          "This account's registration was rejected. Contact the admin for details.",
        );

      default:
        break;
    }

    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(existingUser, jti);
    await addRefreshTokenToWhitelist({
      jti,
      refreshToken,
      userId: existingUser.id,
    });

    createNotification({
      title: "User Logged In",
      message: `User with username ${existingUser.login_username} logged in to the system`,
    });

    res.status(200).json({
      accessToken,
      refreshToken,
      type: existingUser.type,
      id: existingUser.id,
      login_username: existingUser.login_username,
      approved: existingUser.approved,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
