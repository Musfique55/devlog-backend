import { prisma } from "../../../lib/prisma";
import { ICreateLogs } from "./standupLogs.types";

const createLog = async (userId : string,payload : ICreateLogs) => {
    try {
        const result = await prisma.standupLog.create({
            data : {
                todayWork : payload.todayWork,
                tomorrowWork : payload.tomorrowWork,
                blocker : payload.blocker || null,
                projectTag : payload.projectTag || null,
                userId,
                workspaceId : payload.workspaceId || null,
                role : payload.role
            }
        });

        return result;
    } catch (error) {
        throw error;
    }
};

const updateLog = async (id : string,payload : ICreateLogs) => {
    try {
        const result = await prisma.standupLog.update({
            where : {
                id
            },
            data : {
                todayWork : payload.todayWork,
                tomorrowWork :payload.tomorrowWork,
                blocker : payload.blocker || null,
                projectTag : payload.projectTag || null,
            }
        });

        return result;
    } catch (error) {
        throw error;
    }
};

const deleteLog = async (id : string) => {
    try {
        const result = await prisma.standupLog.delete({
            where : {
                id
            }
        });

        return result;
    } catch (error) {
        throw error;
    }
};

const getLogById = async (id : string) => {
    try {
        const result = await prisma.standupLog.findUnique({
            where : {
                id
            }
        });

        return result;
    } catch (error) {
        throw error;
    }
}

const getLogs = async (userId : string) => {
    try {
        const result = await prisma.standupLog.findMany({
            where : {
                userId
            },
        });

        return result;
    } catch (error) {
        throw error;
    }
}

const getLogsByWorkspaceId = async (workspaceId : string) => {
    try {
        const result = await prisma.standupLog.findMany({
            where : {
                workspaceId
            }
        });

        return result;
    } catch (error) {
        throw error;
    }
}

const getAllBlockerLogs = async (blocker : string) => {
    try {
        const result = await prisma.standupLog.findMany({
            where : {
                blocker
            }
        });

        return result;
    } catch (error) {
        throw error;
    }
}

export const StandupLogServices = {
    createLog,
    updateLog,
    deleteLog,
    getLogById,
    getLogs,
    getLogsByWorkspaceId,
    getAllBlockerLogs
};