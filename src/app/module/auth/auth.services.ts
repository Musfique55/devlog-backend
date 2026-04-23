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

const updateProfile = async (
  userId: string,
  payload: { name: string; image: string },
) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new AppError("User not found", status.NOT_FOUND);
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: payload,
    });

    return updatedUser;
  } catch (error) {
    throw error;
  }
};

const getMe = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        workspaces: {
          omit: {
            adminId: true,
            deletedAt: true,
            isDeleted: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError("User not found", status.NOT_FOUND);
    }

    return user;
  } catch (error) {
    throw error;
  }
};

const deleteAccount = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include : {
        workspaces : {
          select : {
            id : true,
            adminId : true,
            members : {
              where : {
                role : TEAM_ROLE.MEMBER
              }
            }
          }
        }
      }
    });

    if (!user) {
      throw new AppError("User not found", status.NOT_FOUND);
    }

    let res;

    if (user.plan === "FREE") {
      res = await prisma.user.delete({
        where: {
          id: userId,
        },
      });
    } else {
      const admins = user.workspaces.filter(
        (workspace) => workspace.adminId === userId,
      );

      res = await prisma.$transaction(async (tx) => {
        if (admins.length > 0) {
          for (const admin of admins) {
            if (admin.members.length > 0) {
              await tx.workspace.update({
                where: {
                  id: admin.id,
                },
                data: {
                  adminId: admin.members[0]!.userId,
                },
              });
            } else {
              await tx.workspace.delete({
                where: {
                  id: admin.id,
                },
              });
            }
          }
        }

        const res = await tx.user.update({
          where: {
            id: userId,
          },
          data: {
            isDeleted: true,
            deletedAt: new Date(),
          },
        });
        return res;
      });
    }

    return res;
  } catch (error) {
    throw error;
  }
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
  updateProfile,
  getNewTokens,
  logoutUser,
  updateEmailVerification,
  getMe,
  deleteAccount,
};
