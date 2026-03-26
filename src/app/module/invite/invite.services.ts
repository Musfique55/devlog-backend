import status from "http-status";
import { prisma } from "../../../lib/prisma";
import AppError from "../../helper/AppError";
import { sendEmail } from "../../utils/sendEmail";
import { Response } from "express";
import { envVars } from "../../config/env";

const inviteMember = async (
  token: string,
  email: string,
  workspaceId: string,
  inviteUrl: string,
) => {
  try {
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

const acceptInvite = async (res: Response, token: string) => {
  try {
    const invite = await prisma.invite.findUnique({
      where: {
        token,
      },
    });

    if (!invite) {
      throw new AppError("token is not valid", status.NOT_FOUND);
    }

    const user = await prisma.user.findUnique({
      where: {
        email: invite.email,
      },
    });

    if (!user) {
      return res.redirect(`${envVars.FRONTEND_URL}/register?token=${token}`);
    }

    const member = await prisma.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId: invite.workspaceId,
      },
    });

    return member;
  } catch (error) {
    throw error;
  }
};

export const inviteServices = {
  inviteMember,
  acceptInvite
};
