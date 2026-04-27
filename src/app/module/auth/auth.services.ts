import status from "http-status";
import { auth } from "../../../lib/auth";
import AppError from "../../helper/AppError";
import { tokenUtils } from "../../utils/token";
import { prisma } from "../../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import { TEAM_ROLE } from "../../../generated/prisma/enums";

const loginUser = async (payload: { email: string; password: string }) => {
  try {
    const { email, password } = payload;
    const data = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });


    if (!data) {
      throw new AppError("User login failed", status.UNAUTHORIZED);
    }

    if (data.user.isBlocked) {
      throw new AppError(
        "Your account has been blocked. Please contact support.",
        status.FORBIDDEN,
      );
    }

    if(data.user.isDeleted){
      throw new AppError(
        "Your account has been deleted. Please contact support.",
        status.FORBIDDEN,
      );
    }

    const payloadForToken = {
      userId: data.user.id,
      email: data.user.email,
      role: data.user.role,
      plan: data.user.plan,
      isBlocked: data.user.isBlocked,
      emailVerified: data.user.emailVerified,
    };
    const accessToken = tokenUtils.createAccessToken(payloadForToken);
    const refreshToken = tokenUtils.createRefreshToken(payloadForToken);

    return {
      ...data,
      accessToken,
      refreshToken,
    };
  } catch (error: any) {
    throw new AppError(error.message, error.statusCode);
  }
};

const registerUser = async (payload: {
  name: string;
  email: string;
  password: string;
  inviteToken: string;
}) => {
  try {
    const { name, email, password, inviteToken } = payload;

    const existingEmail = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingEmail) {
      throw new AppError("user already exist with this email", 400);
    }

    const data = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    if (!data.user) {
      throw new AppError("User registration failed", status.BAD_REQUEST);
    }

    if (inviteToken) {
      await prisma.user.update({
        where: {
          id: data.user.id,
        },
        data: {
          emailVerified: true,
        },
      });
    }

    const payloadForToken = {
      userId: data.user.id,
      email: data.user.email,
      role: data.user.role,
      plan: data.user.plan,
      isBlocked: data.user.isBlocked,
      emailVerified: data.user.emailVerified,
    };
    const accessToken = tokenUtils.createAccessToken(payloadForToken);
    const refreshToken = tokenUtils.createRefreshToken(payloadForToken);

    return {
      ...data,
      accessToken,
      refreshToken,
    };
  } catch (error: any) {
    console.log("Registration error:", error);
    throw error;
  }
};

const getNewTokens = async (refreshToken: string, sessionToken: string) => {
  const currentSessionToken = await prisma.session.findUnique({
    where: {
      token: sessionToken,
    },
    include: {
      user: true,
    },
  });

  if (!currentSessionToken) {
    throw new AppError("Invalid session token", status.UNAUTHORIZED);
  }

  //  token creation date + 30days if expiry date became greater or equal then token expired
  const MAX_SESSION_LIFE = 30 * 24 * 60 * 60 * 1000;

  if (
    Date.now() >=
    currentSessionToken.createdAt.getTime() + MAX_SESSION_LIFE
  ) {
    throw new AppError("Session token expired", status.UNAUTHORIZED);
  }

  const verifyRefreshToken = jwtUtils.verifyToken(
    refreshToken,
    envVars.JWT_SECRET,
  );

  if (!verifyRefreshToken.success) {
    throw new AppError("Invalid refresh token", status.UNAUTHORIZED);
  }

  const verifyRefreshTokenData = verifyRefreshToken.data as JwtPayload;

  if (currentSessionToken.userId !== verifyRefreshTokenData.userId) {
    throw new AppError("Invalid refresh token", status.UNAUTHORIZED);
  }

  const payloadForToken = {
    userId: verifyRefreshTokenData.userId,
    email: verifyRefreshTokenData.email,
    role: verifyRefreshTokenData.role,
    plan: verifyRefreshTokenData.plan,
  };

  const newAccessToken = tokenUtils.createAccessToken(payloadForToken);
  const newRefreshToken = tokenUtils.createRefreshToken(payloadForToken);

  const { token } = await prisma.session.update({
    where: {
      token: sessionToken,
    },
    data: {
      expiresAt: new Date(Date.now() + 60 * 60 * 24 * 1000), // Extend session for another 24 hours
      updatedAt: new Date(),
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionToken: token,
  };
};

const logoutUser = async (sessionToken: string) => {
  const result = await auth.api.signOut({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  return result;
};



const updateEmailVerification = async (userId: string) => {
  try {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        emailVerified: true,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const authService = {
  loginUser,
  registerUser,
  getNewTokens,
  logoutUser,
  updateEmailVerification
};
