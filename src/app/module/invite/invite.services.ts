import status from "http-status";
import { prisma } from "../../../lib/prisma";
import AppError from "../../helper/AppError";
import { InviteStatus } from "../../../generated/prisma/enums";
import { envVars } from "../../config/env";
import { WorkspaceMember } from "../../../generated/prisma/client";

interface AcceptInviteResult {
  redirect: string | null;
  data?: WorkspaceMember;
}

const acceptInvite = async (token: string): Promise<AcceptInviteResult> => {
  try {
    const invite = await prisma.invite.findUnique({
      where: {
        token,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!invite) {
      throw new AppError("invalid invite link", status.NOT_FOUND);
    }

    if (invite.status !== InviteStatus.PENDING) {
      throw new AppError("invite link is not valid", status.BAD_REQUEST);
    }

    const user = await prisma.user.findUnique({
      where: {
        email: invite.email,
      },
    });

    if (!user) {
      return { redirect: `${envVars.FRONTEND_URL}/register?token=${token}` };
    }
    
    const result = await prisma.$transaction(async (tx) => {
      const member = await tx.workspaceMember.create({
        data: {
          userId: user.id,
          workspaceId: invite.workspaceId,
        },
      });
      await tx.invite.update({
        where: {
          token,
        },
        data: {
          status: InviteStatus.ACCEPTED,
        },
      });

      return member;
    });
    return { redirect: null, data: result };
  } catch (error) {
    throw error;
  }
};

const updateExpiredTokens = async () => {
  await prisma.invite.updateMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
    data: {
      status: InviteStatus.EXPIRED,
    },
  });
};

export const inviteServices = {
  acceptInvite,
  updateExpiredTokens,
};
