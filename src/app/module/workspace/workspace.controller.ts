import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { workspaceService } from "./workspace.services";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { APP_ROLE } from "../../../generated/prisma/enums";
import { envVars } from "../../config/env";
import crypto from "crypto";
import { IQueryParams } from "../../types/queryBuilder.types";


const createWorkspace = catchAsync(async (req: Request, res: Response) => {
  const { name } = req.body;
  const id = req.user!.id;
  const data = await workspaceService.createWorkspace(name, id);
  sendResponse(res, {
    statusCode: status.CREATED,
    message: "workspace created successfully",
    success: true,
    data,
  });
});

const inviteMember = catchAsync(async(req : Request,res : Response) => {
    const {email} = req.body;
    const workspaceId = req.params.workspaceId as string;
    const token = crypto.randomBytes(32).toString("hex");
    const inviteUrl = `${envVars.FRONTEND_URL}/invite/accept?token=${token}`;
    const result = await workspaceService.inviteMember(token,email,workspaceId,inviteUrl);

    sendResponse(res,{
        success : true,
        statusCode : 200,
        message : "invite send successfully",
        data : result,
    })

})

const getWorkSpaceById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = await workspaceService.getWorkSpaceById(id as string);
  sendResponse(res, {
    statusCode: status.OK,
    message: "workspace fetched successfully",
    success: true,
    data,
  });
});

const getAllWorkSpaces = catchAsync(async (req: Request, res: Response) => {
  const id = req.user!.id;
  const role = req.user!.role;
  if (role === APP_ROLE.SUPER_ADMIN) {
    const data = await workspaceService.getAllWorkSpaces(req.query as IQueryParams);
    sendResponse(res, {
      statusCode: status.OK,
      message: "workspaces fetched successfully",
      success: true,
      data,
    });
  }
  const data = await workspaceService.getWorkSpacesByUserId(req.query as IQueryParams,id);
  sendResponse(res, {
    statusCode: status.OK,
    message: "workspaces fetched successfully",
    success: true,
    data,
  });
});

const deleteWorkSpace = catchAsync(async (req: Request, res: Response) => {
  await workspaceService.deleteWorkSpace(req.params.id as string);
  sendResponse(res, {
    statusCode: status.OK,
    message: "workspace deleted successfully",
    success: true,
  });
});

const updateWorkSpace = catchAsync(async (req: Request, res: Response) => {
  const data = await workspaceService.updateWorkSpace(
    req.params.id as string,
    req.body,
  );
  sendResponse(res, {
    statusCode: status.OK,
    message: "workspace updated successfully",
    success: true,
    data,
  });
});

export const workspaceController = {
  createWorkspace,
  inviteMember,
  getWorkSpaceById,
  getAllWorkSpaces,
  deleteWorkSpace,
  updateWorkSpace,
};
