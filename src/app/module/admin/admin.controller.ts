import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { IQueryParams } from "../../types/queryBuilder.types";
import { AdminService } from "./admin.services";
import { APP_ROLE } from "../../../generated/prisma/enums";
import status from "http-status";

const getAllUsers = catchAsync(async (req : Request,res : Response) => {
    const query = req.query;
    const result = await AdminService.getAllUsers(query as IQueryParams);
    sendResponse(res,{
        success: true,
        message : "Users retrieved successfully",
        statusCode : 200,
        data : result.data,
        meta : result.meta
    });
});

const updateUserActivityStatus = catchAsync(async (req : Request,res : Response) => {
    const {userId} = req.params;
    await AdminService.updateUserActivityStatus(userId as string,req.body);
    sendResponse(res,{
        success: true,
        message : "User activity status updated successfully",
        statusCode : 200,
    });
});

const getAllWorkSpaces = catchAsync(async (req: Request, res: Response) => {
    const data = await AdminService.getAllWorkSpaces(
      req.query as IQueryParams,
    );
    sendResponse(res, {
      statusCode: status.OK,
      message: "workspaces fetched successfully",
      success: true,
      data: data.data,
      meta : data.meta,
    });

});




export const adminController = {
    getAllUsers,
    updateUserActivityStatus,
    getAllWorkSpaces
}