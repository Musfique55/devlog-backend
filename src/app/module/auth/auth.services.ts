import status from "http-status";
import { auth } from "../../../lib/auth";
import AppError from "../../helper/AppError";

const loginUser = async (payload : { email: string; password: string }) => {
  try {
    const { email, password } = payload;
    const data  = await auth.api.signInEmail({
        body : {
            email,
            password,
        }
    });

    if(!data.user){
        throw new AppError("User login failed", status.UNAUTHORIZED);
    }

    return data;
  } catch (error : any) {
    console.log("Login error:", error);
    throw error;
  }
}

const registerUser = async (payload : { name: string; email: string; password: string }) => {
  try {
    const {name, email, password } = payload;  
    const data = await auth.api.signUpEmail({
        body : {
            email,
            password,
            name,
        }
    });

    if(!data.user){
        throw new AppError("User registration failed", status.BAD_REQUEST);
    }
    
    return data;
  } catch (error : any) {
    console.log("Registration error:", error);
    throw error;
  }
}

export const authService = {
    loginUser,
    registerUser
}