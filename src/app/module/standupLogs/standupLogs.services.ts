import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../../lib/prisma";
import { IQueryParams } from "../../types/queryBuilder.types";
import { QueryBuilder } from "../../utils/queryBuilder";
import { sendEmail } from "../../utils/sendEmail";
import { ICreateLogs, IUpdateLogs } from "./standupLogs.types";

const createLog = async (userId: string, payload: ICreateLogs) => {
  try {
    const result = await prisma.standupLogs.create({
      data: {
        todayWork: payload.todayWork,
        tomorrowWork: payload.tomorrowWork,
        blocker: payload.blocker || null,
        projectTag: payload.projectTag || null,
        userId,
        workspaceId: payload.workspaceId || null,
      },
      include : {
        member : {
          select : {
            name : true,
            email : true,
          }
        },
        workSpace : {
          select : {
            name : true,
            admin : {
              select : {
                email : true,
                role : true,
              }
            }
          }  
        }
      }
    });


    if (result.blocker) {
     const mail = await sendEmail({
        subject: "New Blocker",
        to: result.workSpace!.admin.email,
        templateName: "blocker",
        templateData: {
          date : new Date().toLocaleDateString(),
          memberName: result.member.name,
          workspaceName: result.workSpace!.name,
          blocker: result.blocker,
          blockerImageUrl: result?.blockerUrl,
          todayWork: result.todayWork,
          tomorrowWork: result.tomorrowWork,
        },
      });

      if(!mail.success){
        await prisma.standupLogs.delete({
          where : {
            id : result.id,
          }
        })
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

const deleteLog = async (id: string) => {
  try {
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
          .search(["todayWork", "tomorrowWork", "projectTag"])
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

const getAllBlockerLogs = async (query: IQueryParams, blocker: string) => {
  try {
    const [data, count] = await Promise.all([
      prisma.standupLogs.findMany(
        new QueryBuilder<Prisma.StandupLogsFindManyArgs>(query)
          .filter({ blocker })
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
};
