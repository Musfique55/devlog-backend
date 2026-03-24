class AppError extends Error {
  public readonly statusCode: number;
    constructor(message: string, statusCode : number,stack='') {    
        super(message);
        this.statusCode = statusCode;
        if(stack){
            this.stack = stack;
        }else{
            Error.captureStackTrace(this, this.constructor);
        }
    }   
}
export default AppError;