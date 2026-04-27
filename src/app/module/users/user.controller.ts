import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { IQueryParams } from "../../types/queryBuilder.types";
import { sendResponse } from "../../shared/sendResponse";
import { userServices } from "./user.services";
import status from "http-status";

const getAllUsers = catchAsync(async (req : Request,res : Response) => {
    const query = req.query;
    const result = await userServices.getAllUsers(query as IQueryParams);
    sendResponse(res,{
        success: true,
        message : "Users retrieved successfully",
        statusCode : 200,
        data : result.data,
        meta : result.meta
    });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const payload = {
    ...req.body,
    image: req.file?.path,
  };

  const data = await userServices.updateProfile(userId, payload);
  sendResponse(res, {
    statusCode: status.OK,
    message: "User updated successfully",
    success: true,
    data,
  });
});


const getMe = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const data = await userServices.getMe(userId);
  sendResponse(res, {
    statusCode: status.OK,
    message: "User profile fetched successfully",
    success: true,
    data,
  });
});

const deleteAccount = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  await userServices.deleteAccount(userId);

  sendResponse(res, {
    statusCode: status.OK,
    message: "User deleted successfully",
    success: true,
  });
});

const updateUserActivityStatus = catchAsync(async (req : Request,res : Response) => {
    const {userId} = req.params;
    await userServices.updateUserActivityStatus(userId as string,req.body);
    sendResponse(res,{
        success: true,
        message : "User activity status updated successfully",
        statusCode : 200,
    });
});

export const userController = {
    getAllUsers,
    updateUserActivityStatus,
    getMe,
    deleteAccount,
    updateProfile
}