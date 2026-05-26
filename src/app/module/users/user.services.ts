import status from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import { APP_ROLE, TEAM_ROLE } from "../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma";
import AppError from "../../helper/AppError";
import { IQueryParams } from "../../types/queryBuilder.types";
import { QueryBuilder } from "../../utils/queryBuilder";

interface IUpdateUserActivityStatus {
  isBlocked: boolean;
  blockedReason?: string;
  isDeleted?: boolean;
}

const getAllUsers = async (query: IQueryParams) => {
  try {
    const filterableFields = ["isBlocked", "isDeleted"];
    const filterHistory: Record<string, any> = {
      role: {
        not: APP_ROLE.SUPER_ADMIN,
      },
    };
    for (const key of Object.keys(query)) {
      if (filterableFields.includes(key)) {
        filterHistory[key] = query[key] === "true" ? true : false;
      }
    }
    const queryBuilder = new QueryBuilder<Prisma.UserFindManyArgs>(query)
      .paginate()
      .filter({ ...filterHistory })
      .include("workspaces", ["workspaces"])
      .sort()
      .search(["name", "email"]);

    const [data, total] = await Promise.all([
      prisma.user.findMany(queryBuilder.build()),
      prisma.user.count(queryBuilder.count()),
    ]);

    return {
      data,
      meta: {
        total,
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 10,
        totalPages: Math.ceil(total / Number(query.limit)),
      },
    };
  } catch (error: any) {
    throw error;
  }
};

const updateUserActivityStatus = async (
  userId: string,
  payload: IUpdateUserActivityStatus,
) => {
  try {
    const { isBlocked, blockedReason, isDeleted } = payload;
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isBlocked,
        blockedAt: isBlocked ? new Date() : null,
        blockedReason: isBlocked ? blockedReason || "No reason provided" : null,
        isDeleted: isDeleted || false,
        deletedAt: isDeleted ? new Date() : null,
      },
    });
  } catch (error) {
    throw error;
  }
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
        subscriptions: {
          where: {
            userId: userId,
            status: "ACTIVE",
          },
          select: {
            cancelAtPeriodEnd: true,
            status: true,
            cancelAt: true,
            currentPeriodEnd: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
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
      include: {
        workspaces: {
          select: {
            id: true,
            adminId: true,
            members: {
              where: {
                role: TEAM_ROLE.MEMBER,
              },
            },
          },
        },
      },
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

export const userServices = {
  getAllUsers,
  updateProfile,
  updateUserActivityStatus,
  getMe,
  deleteAccount,
};
