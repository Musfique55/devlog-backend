import status from "http-status";
import { TEAM_ROLE, Workspace } from "../../../generated/prisma/client";
import { prisma } from "../../../lib/prisma";
import AppError from "../../helper/AppError";
import { sendEmail } from "../../utils/sendEmail";

const createWorkspace = async (name: string, userId: string) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name,
          adminId: userId,
        },
      });

      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId,
          role: TEAM_ROLE.ADMIN,
        },
      })

      return workspace;

    })
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
        user : {
          email
        }
      }
    });

    if(existingMember){
      throw new AppError("user already exist in workspace",status.BAD_REQUEST);
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
    });
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getAllWorkSpaces = async () => {
  try {
    const result = await prisma.workspace.findMany();
    return result;
  } catch (error) {
    throw error;
  }
};

const getWorkSpacesByUserId = async (userId: string) => {
  try {
    const result = await prisma.workspace.findMany({
      where: {
        adminId: userId,
      },
    });
    return result;
  } catch (error) {
    throw error;
  }
};


const deleteWorkSpace = async (id: string) => {
    try {
        const result = await prisma.workspace.delete({
            where : {
                id
            }
        });
        return result;
    } catch (error) {
        throw error;
    }
}

const updateWorkSpace = async (id : string,data : Partial<Workspace>) => {
    try {
        const result = await prisma.workspace.update({
            where : {
                id
            },
            data
        });
        return result;
    } catch (error) {
        throw error;
    }
}

export const workspaceService = {
  createWorkspace,
  inviteMember,
  getWorkSpaceById,
  getAllWorkSpaces,
  deleteWorkSpace,
  updateWorkSpace,
  getWorkSpacesByUserId,
};
