import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { inviteServices } from "./invite.services";
import crypto from "crypto";
import { sendResponse } from "../../shared/sendResponse";

const inviteMember = catchAsync(async(req : Request,res : Response) => {
    const {email,workspaceId,inviteUrl} = req.body;
    const token = crypto.randomBytes(32).toString("hex");
    const result = await inviteServices.inviteMember(token,email,workspaceId,inviteUrl);

    sendResponse(res,{
        success : true,
        statusCode : 200,
        message : "invite send successfully",
        data : result,
    })

})

const acceptInvite = catchAsync(async(req : Request,res : Response) => {
    const {token} = req.params;
    const result = await inviteServices.acceptInvite(res,token as string);
    sendResponse(res,{
        success : true,
        statusCode : 200,
        message : "invite accepted successfully",
        data : result,
    })
})

export const inviteController = {
    inviteMember,
    acceptInvite,
}
