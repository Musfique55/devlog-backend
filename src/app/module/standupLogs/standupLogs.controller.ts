import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { StandupLogServices } from "./standupLogs.services";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { IQueryParams } from "../../types/queryBuilder.types";
import { IRequestUser } from "../../middleware/checkAuth";

const createLog = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const payload = req.body;
  const result = await StandupLogServices.createLog(userId as string, payload);
  console.log(result);
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
  const result = await StandupLogServices.updateLog(
    id,
    payload,
    req.user as IRequestUser,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Log updated successfully",
    data: result,
  });
});

const deleteLog = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await StandupLogServices.deleteLog(id, req.user as IRequestUser);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Log deleted successfully",
  });
});

const deleteLogFromWorkspace = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const workspaceId = req.params.workspaceId as string;
    const user = req.user!;
    await StandupLogServices.deleteLogFromWorkspace(id, workspaceId, user);
    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Log deleted successfully",
    });
  },
);

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
  const result = await StandupLogServices.getLogs(
    req.query as IQueryParams,
    userId as string,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Logs fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getLogsByWorkspaceId = catchAsync(async (req: Request, res: Response) => {
  const workspaceId = req.params.workspaceId as string;
  const result = await StandupLogServices.getLogsByWorkspaceId(
    req.query as IQueryParams,
    workspaceId,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Logs fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getAllBlockerLogs = catchAsync(async (req: Request, res: Response) => {
  const { workspaceId, blocker } = req.params as {
    blocker: string;
    workspaceId: string;
  };
  const refined = blocker.split("-").join(" ");
  const result = await StandupLogServices.getAllBlockerLogs(
    req.query as IQueryParams,
    workspaceId,
    refined,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Logs fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const updateBlockerStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const admin = req.user;
  const result = await StandupLogServices.updateBlockerStatus(
    id as string,
    admin as IRequestUser,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Blocker status updated successfully",
    data : result
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
  deleteLogFromWorkspace,
  updateBlockerStatus
};
