const { db } = require('../db');
const { hashToken } = require('../hashTokens');

// used when we create a refresh token.
function addRefreshTokenToWhitelist({ jti, refreshToken, userId }) {
  return db.refreshToken.create({
    data: {
      id: jti,
      hashedToken: hashToken(refreshToken),
      userId
    },
  });
}

// used to check if the token sent by the client is in the database.
function findRefreshTokenById(id) {
  return db.refreshToken.findUnique({
    where: {
      id,
    },
  });
}

// soft delete tokens after usage.
function deleteRefreshToken(id) {
  return db.refreshToken.update({
    where: {
      id,
    },
    data: {
      revoked: true
    }
  });
}

function revokeTokens(userId) {
  return db.refreshToken.updateMany({
    where: {
      userId
    },
    data: {
      revoked: true
    }
  });
}

function verifyOtp(otp, otpInReq) {
  if (!otp)
    throw new Error("No OTP in database");

  console.log(otp.otp, otpInReq)
  if (otp.otp != otpInReq)
    throw new Error("OTP did not match");

  const entryDate = otp.createdAt;
  const timeDiff = Date.now() - entryDate;
  const expiration = 5 * 60 * 1000; // minutesToExpire * secToMinMultiplier * millisecToSecMultiplier

  if (timeDiff > expiration)
    throw new Error("OTP expired");
}


module.exports = {
  addRefreshTokenToWhitelist,
  findRefreshTokenById,
  deleteRefreshToken,
  revokeTokens,
  verifyOtp
};

