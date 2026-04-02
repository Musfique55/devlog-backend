import { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtUtils } from "./jwt";
import { envVars } from "../config/env";
import { Response } from "express";
import { cookieUtils } from "./cookie";

const createAccessToken = (payload : JwtPayload) => {
    const token = jwtUtils.createToken(payload, process.env.JWT_SECRET!, {
        expiresIn : envVars.ACCESS_TOKEN_EXPIRES_IN
    } as SignOptions);
    return token;
};

const createRefreshToken = (payload : JwtPayload) => {
    const token = jwtUtils.createToken(payload, process.env.JWT_SECRET!, {
        expiresIn : envVars.REFRESH_TOKEN_EXPIRES_IN
    } as SignOptions);
    return token;
};

const setAccessTokenCookie = (res : Response, token : string) => {
    cookieUtils.setCookie(res,"accessToken", token, {
        httpOnly : true,    
        secure : true,
        sameSite : "none",
        maxAge : 60 * 60 * 60 * 24 * 1000, // 1 day
        path : "/"
    });
};

const setRefreshTokenCookie = (res : Response, token : string) => {
    cookieUtils.setCookie(res,"refreshToken", token, {
        httpOnly : true,    
        secure : true,
        sameSite : "none",
        maxAge : 60 * 60 * 60 * 24 * 7, // 7 days
        path : "/"
    });
};

const setBetterAuthTokenCookie = (res : Response, token : string) => {
    cookieUtils.setCookie(res,"better-auth.session_token", token, {
        httpOnly : true,    
        secure : true,
        sameSite : "none",
        maxAge : 60 * 60 * 60 * 24 * 1000, // 1 days
        path : "/"
    });
}

export const tokenUtils = {
    createAccessToken,
    createRefreshToken,
    setAccessTokenCookie,
    setRefreshTokenCookie,
    setBetterAuthTokenCookie
}