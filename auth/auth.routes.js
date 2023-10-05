const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { generateTokens } = require('../jwt');
const bcrypt = require('bcrypt');
const {
  addRefreshTokenToWhitelist,
  findRefreshTokenById,
  deleteRefreshToken,
  revokeTokens
} = require('./auth.services');
const jwt = require('jsonwebtoken');

const { user_type, user_approval_type } = require("@prisma/client");

const router = express.Router();
const {
  findUserByUsername,
  findUserById,
  createUser,
} = require('../users/users.services');


const { hashToken } = require('../hashTokens');

router.post('/register', async (req, res, next) => {
  try {
    const { fname, mname, lname, login_username, login_password, addr, cnum, emailaddr, bdate, type } = req.body;
    if (!login_username || !login_password || !fname || !mname || !lname || !addr || !cnum || !emailaddr || !bdate || !type) {
      res.status(400);
      throw new Error(`You must provide an all required fields.`);
    }

    const existingUser = await findUserByUsername(login_username);

    if (existingUser) {
      res.status(400);
      throw new Error('LRN/Username already in use');
    }

    const user = await createUser(req.body);

    res.status(200).json({});
  } catch (err) {
    res.json({ msg: err.message });
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { login_username, login_password } = req.body;
    if (!login_username || !login_password) {
      res.status(400);
      throw new Error('You must provide an email and a password.');
    }

    const existingUser = await findUserByUsername(login_username);

    if (!existingUser) {
      res.status(403);
      throw new Error('Invalid login credentials.');
    }

    const validPassword = await bcrypt.compareSync(login_password, existingUser.login_password);
    if (!validPassword) {
      res.status(403);
      throw new Error('Invalid login credentials.');
    }

    switch (existingUser.approved) {
      case user_approval_type.Pending:
        res.status(403)
        throw new Error('Approval of this account is still pending. Please wait for it to be approved by an admin or contact the admin.')

      case user_approval_type.Unapproved:
        res.status(403)
        throw new Error('This account\'s registration was rejected. Contact the admin for details.')

      default:
        break;
    }

    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(existingUser, jti);
    await addRefreshTokenToWhitelist({ jti, refreshToken, userId: existingUser.id });

    res.status(200).json({
      accessToken,
      refreshToken
    });
  } catch (err) {

    res.json({ msg: err.message });
  }
});

router.post('/refreshToken', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400);
      throw new Error('Missing refresh token.');
    }
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const savedRefreshToken = await findRefreshTokenById(payload.jti);

    if (!savedRefreshToken || savedRefreshToken.revoked === true) {
      res.status(401);
      throw new Error('Unauthorized');
    }

    const hashedToken = hashToken(refreshToken);
    if (hashedToken !== savedRefreshToken.hashedToken) {
      res.status(401);
      throw new Error('Unauthorized');
    }

    const user = await findUserById(payload.userId);
    if (!user) {
      res.status(401);
      throw new Error('Unauthorized');
    }

    await deleteRefreshToken(savedRefreshToken.id);
    const jti = uuidv4();
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user, jti);
    await addRefreshTokenToWhitelist({ jti, refreshToken: newRefreshToken, userId: user.id });

    res.json({
      accessToken,
      refreshToken: newRefreshToken
    });
  } catch (err) {
    next(err);
  }
});

router.get("/usertypes", async (req, res, next) => {
  try {
    const userTypesToReturn = (Object.keys(user_type)).map(
      (key, index) => {
        if (user_type[key] != 'Admin')
          return user_type[key];
      },
    );

    res.json(userTypesToReturn);
  } catch (err) {
    next(err);
  }
});


// This endpoint is only for demo purpose.
// Move this logic where you need to revoke the tokens( for ex, on password reset)
router.post('/revokeRefreshTokens', async (req, res, next) => {
  try {
    const { userId } = req.body;
    await revokeTokens(userId);
    res.json({ message: `Tokens revoked for user with id #${userId}` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

