import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { inviteServices } from "./invite.services";
import { sendResponse } from "../../shared/sendResponse";

const acceptInvite = catchAsync(async (req: Request, res: Response) => {
  const { token } = req.params;
  const result = await inviteServices.acceptInvite(token as string);
  if (result?.redirect) {
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "invite accepted successfully",
      redirect: result.redirect,
    });
  } else {
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "invite accepted successfully",
      data: result.data!,
    });
  }
});

export const inviteController = {
  acceptInvite,
};
