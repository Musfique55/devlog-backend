import status from "http-status";
import z from "zod";

export const zodErrorHelper = (error: z.ZodError) => {

    const statusCode = status.BAD_REQUEST;
    const errorMessage = "Validation error";

    const errors = error.issues.map((err) => {
        return {
            path : err.path.join(" "),
            message : err.message,
        }
     });

    return {
        statusCode,
        success : false,
        message : errorMessage,
        errors,
    }
};
