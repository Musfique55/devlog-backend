import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { StandupLogServices } from "./standupLogs.services";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const createLog = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const payload = req.body;
  const result = await StandupLogServices.createLog(userId as string, payload);
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Log created successfully",
    data: result,
  });
});

const updateLog = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const payload = req.body;
  const result = await StandupLogServices.updateLog(id, payload);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Log updated successfully",
    data: result,
  });
});

const deleteLog = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await StandupLogServices.deleteLog(id);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Log updated successfully",
  });
});

const getLogById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await StandupLogServices.getLogById(id);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Log fetched successfully",
    data: result,
  });
});

const getLogs = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await StandupLogServices.getLogs(req.query,userId as string);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Logs fetched successfully",
    data: result,
  });
});

const getLogsByWorkspaceId = catchAsync(async (req: Request, res: Response) => {
  const workspaceId = req.params.workspaceId as string;
  const result = await StandupLogServices.getLogsByWorkspaceId(workspaceId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Logs fetched successfully",
    data: result,
  });
});

const getAllBlockerLogs = catchAsync(async (req: Request, res: Response) => {
  const blocker = req.params.blocker as string;
  const result = await StandupLogServices.getAllBlockerLogs(blocker);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Logs fetched successfully",
    data: result,
  });
});

export const StandupLogController = {
  createLog,
  updateLog,
  deleteLog,
  getLogById,
  getLogs,
  getLogsByWorkspaceId,
  getAllBlockerLogs,
};
