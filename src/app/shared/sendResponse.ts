import { Response } from "express";

interface IResponse <t>{
    statusCode : number,
    message : string,
    status : boolean,
    data? : t,
    meta? : any
}

export const sendResponse = <t>(res : Response, responseData : IResponse<t>) => {
    res.status(responseData.statusCode).json({
        statusCode: responseData.statusCode,
        message : responseData.message,
        status : responseData.status,
        data: responseData.data,
        meta: responseData.meta
    });
}