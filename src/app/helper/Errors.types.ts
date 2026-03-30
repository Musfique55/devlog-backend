export interface TErrorSources {
    path: string;
    message: string;
}

export interface TErrorResponse {
    success: boolean;
    statusCode: number;
    message: string;
    errorSources?: TErrorSources[];
}
