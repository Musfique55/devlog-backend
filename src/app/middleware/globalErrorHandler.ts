import {Request, Response,NextFunction } from "express";
import z from "zod";
import { zodErrorHelper } from "../helper/zodErrorHelper";
import AppError from "../helper/AppError";
import status from "http-status";
import { cleanupCloudinary } from "../utils/cleanupCloudinary";

export function globalErrorHandler(err : any, req : Request, res : Response, next : NextFunction) {
    let statusCode : number = status.INTERNAL_SERVER_ERROR;
    let message = err.message || "Internal Server Error";
    let stack = "";
    let errors : { path: string; message: string }[] = [];

    cleanupCloudinary(req);

    if(err instanceof z.ZodError){
        const zodError = zodErrorHelper(err);
        statusCode = zodError.statusCode;
        message = zodError.message;
        errors = zodError.errors;
    }else if(err instanceof AppError){
        statusCode = err.statusCode;
        message = err.message;
        stack = err.stack || "";
        errors = [
            {
                path : "",
                message : err.message,
            }
        ]
    }else if(err instanceof Error){
        statusCode = status.INTERNAL_SERVER_ERROR;
        message = err.message || "Internal Server Error";
        stack = err.stack || "";
        errors = [
            {
                path : "",
                message : err.message,
            }
        ]
    }

    const errorResponse = {
        statusCode,
        success : false,
        message,
        errors,
        stack : process.env.NODE_ENV === "development" ? stack : undefined,
        error : process.env.NODE_ENV === "development" ? err : undefined,
    }

    res.status(statusCode).json(errorResponse);

}   