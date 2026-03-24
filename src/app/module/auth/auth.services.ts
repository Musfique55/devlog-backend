import status from "http-status";
import { auth } from "../../../lib/auth";
import AppError from "../../helper/AppError";
import { tokenUtils } from "../../utils/token";

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

    const payloadForToken = {
        userId: data.user.id,
        email: data.user.email,
        role: data.user.role,
        plan: data.user.plan,
    }
    const accessToken = tokenUtils.createAccessToken(payloadForToken);
    const refreshToken = tokenUtils.createRefreshToken(payloadForToken);

    return {
      ...data,
      accessToken,
      refreshToken,
    };
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

    const payloadForToken = {
        userId: data.user.id,
        email: data.user.email,
        role: data.user.role,
        plan: data.user.plan,
    }
    const accessToken = tokenUtils.createAccessToken(payloadForToken);
    const refreshToken = tokenUtils.createRefreshToken(payloadForToken);

    return {
      ...data,
      accessToken,
      refreshToken,
    };
    
  } catch (error : any) {
    console.log("Registration error:", error);
    throw error;
  }
}

export const authService = {
    loginUser,
    registerUser
}