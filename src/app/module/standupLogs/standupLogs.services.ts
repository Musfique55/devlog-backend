import status from "http-status";
import { APP_ROLE, BlockerStatus, Prisma, TEAM_ROLE } from "../../../generated/prisma/client";
import { prisma } from "../../../lib/prisma";
import AppError from "../../helper/AppError";
import { IQueryParams } from "../../types/queryBuilder.types";
import { QueryBuilder } from "../../utils/queryBuilder";
import { sendEmail } from "../../utils/sendEmail";
import { ICreateLogs, IUpdateLogs } from "./standupLogs.types";
import { IRequestUser } from "../../middleware/checkAuth";
import { envVars } from "../../config/env";


const updateStreak = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new AppError("User not found", status.NOT_FOUND);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastLog = user.lastLogDate ? new Date(user.lastLogDate) : null;

    let newStreak = 1;

    if (lastLog) {
      if (lastLog.getTime() === today.getTime()) {
        return; // Already updated today
      } else if (lastLog.getTime() === yesterday.getTime()) {
        newStreak = (user?.currentStreak ?? 0) + 1; // Increment streak
      } else {
        newStreak = 1; // Reset streak
      }
    }

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        currentStreak: newStreak,
        lastLogDate: today,
        longestStreak:
          newStreak > (user.longestStreak ?? 0)
            ? newStreak
            : user.longestStreak,
      },
    });
  } catch (error) {
    throw error;
  }
};

const createLog = async (userId: string, payload: ICreateLogs) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new AppError("User not found", status.NOT_FOUND);
    }

    if (user.isBlocked) {
      throw new AppError(
        "You are blocked. Please contact support.",
        status.FORBIDDEN,
      );
    }

    const result = await prisma.standupLogs.create({
      data: {
        userId,
        todayWork: payload.todayWork,
        tomorrowWork: payload.tomorrowWork,
        blocker: payload.blocker || null,
        blockerUrl: payload.blockerUrl || [],
        projectTags: payload.projectTags || [],
        workspaceId: payload.workspaceId || null,
        ...(payload.blocker && {blockerStatus : BlockerStatus.OPEN})
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        workSpace: {
          select: {
            name: true,
            admin: {
              select: {
                email: true,
                role: true,
                plan : true
              },
            },
          },
        },
      },
    });

    if (result.blocker && result.workspaceId && result.workSpace?.admin.plan === "PRO") {
      const mail = await sendEmail({
        subject: "New Blocker",
        to: result.workSpace!.admin.email,
        templateName: "blocker",
        templateData: {
          date: new Date().toLocaleDateString(),
          memberName: result.user.name,
          workspaceName: result.workSpace!.name,
          blocker: result.blocker,
          blockerImageUrl: result?.blockerUrl,
          todayWork: result.todayWork,
          tomorrowWork: result.tomorrowWork,
        },
      });

      if (!mail.success) {
        await prisma.standupLogs.delete({
          where: {
            id: result.id,
          },
        });
      }
    }

    await updateStreak(userId);

    if(result.workspaceId){
      const {plan,...admin} = result.workSpace!.admin;
      
      return {
        ...result,
        workSpace : {
          ...result.workSpace,
          admin
        }
      };
    }

    return result;

  } catch (error) {
    throw error;
  }
};

const updateLog = async (
  id: string,
  payload: IUpdateLogs,
  user: IRequestUser,
) => {
  try {
    if (user.isBlocked) {
      throw new AppError(
        "You are blocked. Please contact support.",
        status.FORBIDDEN,
      );
    }

    const log = await prisma.standupLogs.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!log) {
      throw new AppError("Log not found", status.NOT_FOUND);
    }

    const result = await prisma.standupLogs.update({
      where: {
        id,
      },
      data: {
        todayWork: payload.todayWork,
        tomorrowWork: payload.tomorrowWork,
        blocker: payload.blocker || null,
        projectTags: payload.projectTags || [],
      },
    });

    return result;
  } catch (error) {
    throw error;
  }
};

const deleteLog = async (id: string, user: IRequestUser) => {
  try {
    const log = await prisma.standupLogs.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!log) {
      throw new AppError("Log not found", status.NOT_FOUND);
    }

    if (
      log.userId !== user.id ||
      user.role === APP_ROLE.SUPER_ADMIN ||
      log.id !== id
    ) {
      throw new AppError(
        "you are not authorized to delete this log",
        status.UNAUTHORIZED,
      );
    }

    const result = await prisma.standupLogs.delete({
      where: {
        id,
      },
    });

    return result;
  } catch (error) {
    throw error;
  }
};

const deleteLogFromWorkspace = async (
  id: string,
  workspaceId: string,
  user: IRequestUser,
) => {
  try {
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      include: {
        members: {
          where: {
            user: {
              id: user.id,
            },
          },
        },
      },
    });

    if (
      workspace?.id !== workspaceId ||
      workspace?.members?.[0]?.role !== TEAM_ROLE.ADMIN
    ) {
      throw new AppError(
        "you are not authorized to delete this log",
        status.UNAUTHORIZED,
      );
    }

    const result = await prisma.standupLogs.delete({
      where: {
        id,
      },
    });
    return result;
  } catch (error) {
    throw error;
  }
};

const getLogById = async (id: string) => {
  try {
    const result = await prisma.standupLogs.findUnique({
      where: {
        id,
      },
    });

    return result;
  } catch (error) {
    throw error;
  }
};

const getLogs = async (query: IQueryParams, userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new AppError("User not found", status.NOT_FOUND);
    }

    const additionalFilters: Prisma.StandupLogsWhereInput[] = [];

    const queryWhere =
      user.plan === "FREE"
        ? {
            userId,
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          }
        : { userId };

    if (query.searchTerm && query.searchTerm !== "") {
      additionalFilters.push({
        todayWork: {
          contains: query.searchTerm,
          mode: "insensitive",
        },
      },{
        tomorrowWork: {
          contains: query.searchTerm,
          mode: "insensitive",
        }
      },
      {
        blocker: {
          contains: query.searchTerm,
          mode: "insensitive",
        }
      },{
         projectTags: {
          hasSome: query.searchTerm.split(","),
        },
      }
    );
    }

    const [data, count] = await Promise.all([
      prisma.standupLogs.findMany({
        where: {
          ...queryWhere,
          ...(additionalFilters.length >0 && {OR: additionalFilters})
        },
        take : Number(query.limit) || 10,
        skip : Number(query.page) ? (Number(query.page) - 1) * Number(query.limit) : 0,
        orderBy: {
          [query.sortBy || "createdAt"]: query.sortOrder || "desc",
        },
      }),
      prisma.standupLogs.count({
        where: {
          ...queryWhere,
          ...(additionalFilters.length >0 && {OR: additionalFilters})
        },
      }),
    ]);


    return {
      data,
      meta: {
        total: count,
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 10,
        totalPages: Math.ceil(count / Number(query.limit || 10)),
      },
    };
  } catch (error) {
    throw error;
  }
};

const getLogsByWorkspaceId = async (
  query: IQueryParams,
  workspaceId: string,
) => {
  try {
    const queryBuilder = new QueryBuilder<Prisma.StandupLogsFindManyArgs>(query)
      .filter({ workspaceId })
      .search(["todayWork", "tomorrowWork", "projectTags", "blocker"])
      .sort()
      .include("user",["user"])
      .paginate();

    const [data, count] = await Promise.all([
      prisma.standupLogs.findMany(queryBuilder.build()),
      prisma.standupLogs.count(queryBuilder.count()),
    ]);

    return {
      data,
      meta: {
        total: count,
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 10,
        totalPages: Math.ceil(count / Number(query.limit || 10)),
      },
    };
  } catch (error) {
    throw error;
  }
};

const getAllBlockerLogs = async (
  query: IQueryParams,
  workspaceId: string,
  blocker: string,
) => {
  try {
    const queryBuilder = new QueryBuilder<Prisma.StandupLogsFindManyArgs>(query)
      .filter({
        workspaceId: workspaceId,
        blocker: {
          contains: blocker,
          mode: "insensitive",
        },
      })
      .sort()
      .paginate();
    const [data, count] = await Promise.all([
      prisma.standupLogs.findMany(queryBuilder.build()),
      prisma.standupLogs.count(queryBuilder.count()),
    ]);

    return {
      data,
      meta: {
        total: count,
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 10,
        totalPages: Math.ceil(count / Number(query.limit || 10)),
      },
    };
  } catch (error) {
    throw error;
  }
};

const updateBlockerStatus = async (logId: string, admin : IRequestUser) => {
  try {
    const log = await prisma.standupLogs.findUnique({
      where: {
        id: logId,
      },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if(!log){
      throw new AppError("Log not found", status.NOT_FOUND);
    }

    const data = await prisma.standupLogs.update({
      where: {
        id: logId,
      },
      data: {
        blockerStatus: BlockerStatus.RESOLVED,
        blockerResolvedBy : admin.id,
        blockerResolvedAt : new Date()
      },
      include: {
        user: true,
        workSpace : true
      },  
    })

    await sendEmail({
      subject: "Blocker Resolved",
      to: log.user.id,
      templateName: "blocker-resolved",
      templateData: {
        date: new Date().toLocaleDateString(),
        memberName: data.user.name,
        blocker: data.blocker,
        adminName : admin.name,
        workspaceName: data.workSpace!.name,
        resolvedAt : data.blockerResolvedAt?.toLocaleDateString(),
        dashboardUrl :`${envVars.FRONTEND_URL}/dashboard`
      },
    });

  } catch (error) {
    throw error;
  }
}

const getWeeklyLogsReport = async (query: IQueryParams, userId: string) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [logs, count] = await Promise.all([
      prisma.standupLogs.findMany({
        where: {
          userId,
          createdAt: {
            gte: oneWeekAgo,
            lte: today,
          },
        },
        include: {
          user: true,
          workSpace: {
            select: {
              name: true,
              members: {
                select: {
                  user: {
                    select: {
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
        skip:
          query?.page && query?.limit
            ? (Number(query.page) - 1) * Number(query.limit)
            : 0,
        take: Number(query.limit) || 10,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.standupLogs.count({
        where: {
          userId,
          createdAt: {
            gte: oneWeekAgo,
            lte: today,
          },
        },
      }),
    ]);

    return {
      data: logs,
      meta: {
        total: count,
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 10,
        totalPages: Math.ceil(count / Number(query.limit || 10)),
      },
    };
  } catch (error) {
    throw error;
  }
};

const standupLogCount = async (userId: string) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = await prisma.standupLogs.count({
      where: {
        userId,
        createdAt: {
          gte: oneWeekAgo,
          lte: today,
        },
      },
    });

    return count;
  } catch (error) {
    throw error;
  }
};

export const StandupLogServices = {
  createLog,
  updateLog,
  deleteLog,
  getLogById,
  getLogs,
  getLogsByWorkspaceId,
  getAllBlockerLogs,
  deleteLogFromWorkspace,
  getWeeklyLogsReport,
  standupLogCount,
  updateBlockerStatus
};
