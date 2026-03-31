import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { checkoutServices } from "./checkout.services";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import AppError from "../../helper/AppError";

const createCheckoutSession = catchAsync(async (req : Request, res : Response) => {
    try {
        const result = await checkoutServices.createCheckoutSession(req.user!);

        sendResponse(res, {
            success : true,
            statusCode: status.CREATED,
            message : "checkout session created successfully",
            data : result
        });

    } catch (error : any) {
        console.log(error.message);
        throw new AppError("something went wrong", status.BAD_REQUEST)
    }
})

export const checkoutController ={
    createCheckoutSession
}