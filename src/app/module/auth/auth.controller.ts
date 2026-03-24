import { Request, Response } from "express";
import { catchAsync } from "../../helper/catchAsync";
import { authService } from "./auth.services";
import { sendResponse } from "../../helper/sendResponse";
import { status } from "http-status";

const loginUser = catchAsync(async (req : Request, res : Response) => {
    const { email, password } = req.body;
    const data = await authService.loginUser({ email, password });
    sendResponse(res, {
        statusCode : status.OK,
        message : "User logged in successfully",
        status : true,
        data,
    });
});

const registerUser = catchAsync(async (req : Request, res : Response) => {
    const { name, email, password } = req.body;
    const data = await authService.registerUser({ name, email, password });
    sendResponse(res, {
        statusCode : status.CREATED,
        message : "User registered successfully",
        status : true,
        data,
    });
    res.json(data);
});

export const authController = {
    loginUser,
    registerUser
}