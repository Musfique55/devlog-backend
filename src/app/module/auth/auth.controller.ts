import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { authService } from "./auth.services";
import { sendResponse } from "../../shared/sendResponse";
import { status } from "http-status";
import { tokenUtils } from "../../utils/token";

const loginUser = catchAsync(async (req : Request, res : Response) => {
    const { email, password } = req.body;
    const data = await authService.loginUser({ email, password });
    tokenUtils.setAccessTokenCookie(res, data.accessToken);
    tokenUtils.setRefreshTokenCookie(res, data.refreshToken);
    tokenUtils.setBetterAuthTokenCookie(res, data.token);
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
    tokenUtils.setAccessTokenCookie(res, data.accessToken);
    tokenUtils.setRefreshTokenCookie(res, data.refreshToken);
    tokenUtils.setBetterAuthTokenCookie(res, data.token as string);
    sendResponse(res, {
        statusCode : status.CREATED,
        message : "User registered successfully",
        status : true,
        data,
    });
});

export const authController = {
    loginUser,
    registerUser
}