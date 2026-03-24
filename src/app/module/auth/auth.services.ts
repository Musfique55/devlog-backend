import status from "http-status";
import { auth } from "../../../lib/auth";
import AppError from "../../helper/AppError";
import { tokenUtils } from "../../utils/token";
import { prisma } from "../../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";

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

const getNewTokens = async ( refreshToken: string ,sessionToken : string) => {
  const currentSessionToken = await prisma.session.findUnique({
    where : {
      token : sessionToken
    },
    include : {
      user : true
    }
  });


  if(!currentSessionToken){
    throw new AppError("Invalid session token", status.UNAUTHORIZED);
  }

  const verifyRefreshToken = jwtUtils.verifyToken(refreshToken,envVars.JWT_SECRET);

  if(!verifyRefreshToken.success){
    throw new AppError("Invalid refresh token", status.UNAUTHORIZED);
  }

  const verifyRefreshTokenData = verifyRefreshToken.data as JwtPayload;

  if(currentSessionToken.userId !== verifyRefreshTokenData.userId){
    throw new AppError("Invalid refresh token", status.UNAUTHORIZED);
  }

  const payloadForToken = {
    userId: verifyRefreshTokenData.userId,
    email: verifyRefreshTokenData.email,
    role: verifyRefreshTokenData.role,
    plan: verifyRefreshTokenData.plan,
  }


  const newAccessToken = tokenUtils.createAccessToken(payloadForToken);
  const newRefreshToken = tokenUtils.createRefreshToken(payloadForToken);


  const {token} = await prisma.session.update({
    where : {
      token : sessionToken
    },
    data : {
      expiresAt : new Date(Date.now() + 60 * 60 *  24 * 1000), // Extend session for another 24 hours
      updatedAt : new Date(),
    }
  })

  return {
    accessToken : newAccessToken,
    refreshToken : newRefreshToken,
    sessionToken : token
  }

}

const logoutUser = async (sessionToken : string) => {
  const result = await auth.api.signOut({
    headers : new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  return result;
}


export const authService = {
    loginUser,
    registerUser,
    getNewTokens,
    logoutUser
}