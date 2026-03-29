import status from "http-status";
import { APP_ROLE, Prisma, TEAM_ROLE } from "../../../generated/prisma/client";
import { prisma } from "../../../lib/prisma";
import AppError from "../../helper/AppError";
import { IQueryParams } from "../../types/queryBuilder.types";
import { QueryBuilder } from "../../utils/queryBuilder";
import { sendEmail } from "../../utils/sendEmail";
import { ICreateLogs, IUpdateLogs } from "./standupLogs.types";
import { IRequestUser } from "../../middleware/checkAuth";

const createLog = async (userId: string, payload: ICreateLogs) => {
  try {
    const result = await prisma.standupLogs.create({
      data: {
        todayWork: payload.todayWork,
        tomorrowWork: payload.tomorrowWork,
        blocker: payload.blocker || null,
        blockerUrl: payload.blockerUrl || [],
        projectTag: payload.projectTag || null,
        userId,
        workspaceId: payload.workspaceId || null,
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
              },
            },
          },
        },
      },
    });

    if (result.blocker && result.workspaceId) {
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

    return result;
  } catch (error) {
    throw error;
  }
};

const updateLog = async (id: string, payload: IUpdateLogs) => {
  try {
    const result = await prisma.standupLogs.update({
      where: {
        id,
      },
      data: {
        todayWork: payload.todayWork,
        tomorrowWork: payload.tomorrowWork,
        blocker: payload.blocker || null,
        projectTag: payload.projectTag || null,
      },
    });

    return result;
  } catch (error) {
    throw error;
  }
};

const deleteLog = async (id: string,user : IRequestUser) => {
  try {
    const log = await prisma.standupLogs.findUnique({
      where : {
        id,
      },
      include : {
       user : {
        select : {
          id : true,
        }
       }
      }
    });

    if(!log){
      throw new AppError("Log not found",status.NOT_FOUND);
    }

    if(log.user.id !== user.id || user.role !== APP_ROLE.SUPER_ADMIN || log.id !== id){
      throw new AppError("you are not authorized to delete this log",status.UNAUTHORIZED);
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

const deleteLogFromWorkspace = async (id: string,workspaceId:string,user:IRequestUser) => {
  try {
    const workspace = await prisma.workspace.findUnique({
      where : {
        id : workspaceId,
      },
      include :{
        members : {
          where : {
            user : {
              id : user.id,
            }
          }
        }
      }
    });

    if(workspace?.id !== workspaceId || workspace?.members?.[0]?.role !== TEAM_ROLE.ADMIN){
      throw new AppError("you are not authorized to delete this log",status.UNAUTHORIZED);
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
    const [data, count] = await Promise.all([
      prisma.standupLogs.findMany(
        new QueryBuilder<Prisma.StandupLogsFindManyArgs>(query)
          .filter({ userId })
          .search(["todayWork", "tomorrowWork", "projectTag", "blocker"])
          .sort()
          .paginate()
          .build(),
      ),
      prisma.standupLogs.count(new QueryBuilder(query).getWhere()),
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
    const [data, count] = await Promise.all([
      prisma.standupLogs.findMany(
        new QueryBuilder<Prisma.StandupLogsFindManyArgs>(query)
          .filter({ workspaceId })
          .search(["todayWork", "tomorrowWork", "projectTag", "blocker"])
          .sort()
          .paginate()
          .build(),
      ),
      prisma.standupLogs.count(new QueryBuilder(query).getWhere()),
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

const getAllBlockerLogs = async (query: IQueryParams, workspaceId : string,blocker: string) => {
  try {
    
    const [data, count] = await Promise.all([
      prisma.standupLogs.findMany(
        new QueryBuilder<Prisma.StandupLogsFindManyArgs>(query)
          .filter({
            workspaceId: workspaceId,
            blocker: {
              contains: blocker,
              mode: "insensitive",
            },
          })
          .sort()
          .paginate()
          .build(),
      ),
      prisma.standupLogs.count(new QueryBuilder(query).getWhere()),
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

export const StandupLogServices = {
  createLog,
  updateLog,
  deleteLog,
  getLogById,
  getLogs,
  getLogsByWorkspaceId,
  getAllBlockerLogs,
  deleteLogFromWorkspace
};
