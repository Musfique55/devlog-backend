import { NextFunction, Request, Response } from "express";

const zodRequestValidation = (schemaOrFactory : any) => {
    return (req : Request, res : Response, next : NextFunction) => {

        if(typeof req.body.data === "string"){
            req.body = JSON.parse(req.body.data);
        }

        const schema = typeof schemaOrFactory === "function" ? schemaOrFactory(req.user?.plan) : schemaOrFactory;

        const parsedSchema = schema.safeParse(req.body);  
        if (!parsedSchema.success) {
           next(parsedSchema.error);
        }

        req.body = parsedSchema.data;
        next();
    };
};

export default zodRequestValidation;