
import { APP_ROLE, Prisma } from "../../../generated/prisma/client"
import { prisma } from "../../../lib/prisma"
import AppError from "../../helper/AppError"
import { IQueryParams } from "../../types/queryBuilder.types"
import { QueryBuilder } from "../../utils/queryBuilder"

interface IUpdateUserActivityStatus {
    isBlocked : boolean,
    blockedReason? : string,
    isDeleted? : boolean
}

const getAllUsers = async (query : IQueryParams) => {
    try {
        const filterableFields = ["isBlocked","isDeleted"];
        const filterHistory : Record<string,any> = {
            role : {
                not : APP_ROLE.SUPER_ADMIN
            }
        };
        for(const key of Object.keys(query)){
            if(filterableFields.includes(key)){
                filterHistory[key] = query[key] === "true" ? true : false;
            }
        }
        const queryBuilder = new QueryBuilder<Prisma.UserFindManyArgs>(query)
        .paginate()
        .filter({...filterHistory})
        .include("workspaces",["workspaces"])
        .sort().search(["name","email"])

        const [data,total] = await Promise.all([
            prisma.user.findMany(queryBuilder.build()),
            prisma.user.count(queryBuilder.count())
        ]);

        return {
            data,
            meta : {
                total,
                page : Number(query.page) || 1,
                limit : Number(query.limit) || 10,
                totalPages : Math.ceil(total / Number(query.limit))
            }
        }

    } catch (error : any) {
        throw error;
    }
}

const getUserById = async (userId : string) => {
    try {
        const user = await prisma.user.findUnique({
            where : {
                id : userId
            },
            include : {
                workspaces : true
            }
        });

        return user;
    } catch (error) {
        
    }
}


const updateUserActivityStatus = async (userId: string, payload : IUpdateUserActivityStatus) => {
    try {
        const {isBlocked,blockedReason,isDeleted} = payload;
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        if (!user) {
            throw new AppError("User not found", 404);
        }   

        await prisma.user.update({
            where: {
                id: userId, 
            },
            data: {
                isBlocked,
                blockedAt : isBlocked ? new Date() : null,
                blockedReason : isBlocked ? blockedReason || "No reason provided" : null,
                isDeleted : isDeleted || false,
                deletedAt : isDeleted ? new Date() : null
            },
        });
    } catch (error) {
        throw error;
    }
}

const deleteUser = async (userId: string) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        if (!user) {
            throw new AppError("User not found", 404);
        }

        if(user.isDeleted){
            throw new AppError("User already deleted",400);
        }

        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });

    } catch (error) {
        throw error;
    }
}


export const UserService = {
    getAllUsers,
    getUserById,
    updateUserActivityStatus,
    deleteUser
}