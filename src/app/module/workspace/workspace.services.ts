import status from "http-status";
import { APP_ROLE, TEAM_ROLE, Workspace } from "../../../generated/prisma/client";
import { prisma } from "../../../lib/prisma";
import AppError from "../../helper/AppError";
import { sendEmail } from "../../utils/sendEmail";
import { QueryBuilder } from "../../utils/queryBuilder";
import { IQueryParams } from "../../types/queryBuilder.types";
import { WorkspaceFindManyArgs } from "../../../generated/prisma/models";
import { IRequestUser } from "../../middleware/checkAuth";

const createWorkspace = async (name: string, userId: string) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name,
          adminId: userId,
        },
        include: {
          admin: true,
        },
      });

      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId,
          role: TEAM_ROLE.ADMIN,
        },
      });

      return workspace;
    });
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const inviteMember = async (
  token: string,
  email: string,
  workspaceId: string,
  inviteUrl: string,
) => {
  try {
    const existingMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        user: {
          email,
        },
      },
    });

    if (existingMember) {
      throw new AppError("user already exist in workspace", status.BAD_REQUEST);
    }

    const existingInvite = await prisma.invite.findFirst({
      where: {
        token,
        workspaceId,
      },
    });

    if (existingInvite) {
      await prisma.invite.delete({
        where: {
          id: existingInvite.id,
        },
      });
    }

    const response = await prisma.invite.create({
      data: {
        token,
        email,
        workspaceId,
        expiresAt: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000), //7days
      },
      select: {
        workspace: {
          select: {
            name: true,
            admin: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (response) {
      await sendEmail({
        subject: "Invitation Link",
        to: email,
        templateName: "invite",
        templateData: {
          adminName: response.workspace.admin.name,
          workspaceName: response.workspace.name,
          inviteUrl,
          inviteeEmail: email,
          token,
        },
      });
    }
    return response;
  } catch (error) {
    throw error;
  }
};

const getWorkSpaceById = async (id: string) => {
  try {
    const result = await prisma.workspace.findUnique({
      where: {
        id,
      },
      omit : {
        adminId : true
      },
      include : {
        admin : {
          select : {
            id : true,
            name : true,
            email : true,
            role : true,
            createdAt : true,
            updatedAt : true,
          }
        }
      }
    });
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getAllWorkSpaces = async (query: IQueryParams) => {
  try {
    const builder = new QueryBuilder<WorkspaceFindManyArgs>(query)
      .search(["name", "admin.name", "admin.email","admin.id"])
      .sort()
      .paginate();

    const [data, count] = await Promise.all([
      prisma.workspace.findMany(builder.build()),
      prisma.workspace.count(builder.count()),
    ]);
    return {
      data,
      meta: {
        total: count,
        page: query.page,
        limit: Number(query.limit) || 10,
        totalPages: Math.ceil(count / Number(query.limit || 10)),
      },
    };
  } catch (error) {
    throw error;
  }
};

const getWorkSpacesByUserId = async (query: IQueryParams, userId: string) => {
  try {
    const builder = new QueryBuilder<WorkspaceFindManyArgs>(query)
      .sort()
      .paginate()
      .search(["name"])
      .filter({
        adminId: userId,
      });
    const [data, count] = await Promise.all([
      prisma.workspace.findMany(builder.build()),
      prisma.workspace.count(builder.count())
    ]);
    return {
      data,
      meta: {
        total: count,
        page: query.page,
        limit: Number(query.limit) || 10,
        totalPages: Math.ceil(count / Number(query.limit || 10)),
      },
    };
  } catch (error) {
    throw error;
  }
};

const deleteWorkSpace = async (id: string,user : IRequestUser) => {
  try {
    
    const workspace = await prisma.workspace.findUnique({
      where: {
        id,
        isDeleted: false,
      }
    });


    if (!workspace) {
      throw new AppError("workspace not found", status.NOT_FOUND);
    }

    if(workspace.adminId !== user.id && user.role !== APP_ROLE.SUPER_ADMIN){
      throw new AppError("you are not authorized to delete this workspace",status.UNAUTHORIZED);
    }


    const result = await prisma.workspace.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
    return result;
  } catch (error) {
    throw error;
  }
};

const updateWorkSpace = async (id: string, data: Partial<Workspace>) => {
  try {
    console.log(id);
    const workspace = await prisma.workspace.findUnique({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!workspace) {
      throw new AppError("workspace not found", status.NOT_FOUND);
    }
    const result = await prisma.workspace.update({
      where: {
        id,
      },
      data,
    });
    return result;
  } catch (error) {
    throw error;
  }
};

export const workspaceService = {
  createWorkspace,
  inviteMember,
  getWorkSpaceById,
  getAllWorkSpaces,
  deleteWorkSpace,
  updateWorkSpace,
  getWorkSpacesByUserId,
};
