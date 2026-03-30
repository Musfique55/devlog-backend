import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { UserService } from "./user.services";
import { IQueryParams } from "../../types/queryBuilder.types";
import { sendResponse } from "../../shared/sendResponse";

const getAllUsers = catchAsync(async (req : Request,res : Response) => {
    const query = req.query;
    const result = await UserService.getAllUsers(query as IQueryParams);
    sendResponse(res,{
        success: true,
        message : "Users retrieved successfully",
        statusCode : 200,
        data : result.data,
        meta : result.meta
    });
});

const getUserById = catchAsync(async (req : Request,res : Response) => {
    const {userId} = req.params;
    const user = await UserService.getUserById(userId as string);
    if(!user){
        sendResponse(res,{
            success: false,
            message : "User not found",
            statusCode : 404
        }); 
        return;
    }   
    sendResponse(res,{
        success: true,
        message : "User retrieved successfully",
        statusCode : 200,
        data : user
    });
});

const updateUserActivityStatus = catchAsync(async (req : Request,res : Response) => {
    const {userId} = req.params;
    await UserService.updateUserActivityStatus(userId as string,req.body);
    sendResponse(res,{
        success: true,
        message : "User activity status updated successfully",
        statusCode : 200,
    });
});

const deleteUser = catchAsync(async (req : Request,res : Response) => {
    const {userId} = req.params;
    await UserService.deleteUser(userId as string);
    sendResponse(res,{
        success: true,
        message : "User deleted successfully",
        statusCode : 200,
    });
});

export const UserController = {
    getAllUsers,
    getUserById,
    updateUserActivityStatus,
    deleteUser
}