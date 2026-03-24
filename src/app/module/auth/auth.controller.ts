import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { authService } from "./auth.services";
import { sendResponse } from "../../shared/sendResponse";
import { status } from "http-status";
import { tokenUtils } from "../../utils/token";
import { cookieUtils } from "../../utils/cookie";

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

const getNewTokens = catchAsync(async (req : Request, res : Response) => { 
    const refreshToken = req.cookies.refreshToken;
    const sessionToken = req.cookies["better-auth.session_token"];
    const data = await authService.getNewTokens(refreshToken, sessionToken);
    tokenUtils.setAccessTokenCookie(res, data.accessToken);
    tokenUtils.setRefreshTokenCookie(res, data.refreshToken);
    tokenUtils.setBetterAuthTokenCookie(res, data.sessionToken);
    sendResponse(res, {
        statusCode : status.OK,
        message : "New tokens generated successfully",
        status : true,
        data,
    });
 });

 const logoutUser = catchAsync(async (req : Request, res : Response) => {
    const sessionToken = req.cookies["better-auth.session_token"];
    await authService.logoutUser(sessionToken);

    cookieUtils.clearCookie(res, "accessToken");
    cookieUtils.clearCookie(res, "refreshToken");
    cookieUtils.clearCookie(res, "better-auth.session_token");

    sendResponse(res, {
        statusCode : status.OK,
        message : "User logged out successfully",
        status : true,
    });
 });



export const authController = {
    loginUser,
    registerUser,
    getNewTokens,
    logoutUser
}