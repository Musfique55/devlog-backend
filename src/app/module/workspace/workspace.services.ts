import { Workspace } from "../../../generated/prisma/client";
import { prisma } from "../../../lib/prisma";

const createWorkspace = async (name: string, userId: string) => {
  try {
    const result = await prisma.workspace.create({
      data: {
        name,
        adminId: userId,
      },
    });
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getWorkSpaceById = async (id: string) => {
  try {
    const result = await prisma.workspace.findUnique({
      where: {
        id,
      },
    });
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getAllWorkSpaces = async () => {
  try {
    const result = await prisma.workspace.findMany();
    return result;
  } catch (error) {
    throw error;
  }
};

const getWorkSpacesByUserId = async (userId: string) => {
  try {
    const result = await prisma.workspace.findMany({
      where: {
        adminId: userId,
      },
    });
    return result;
  } catch (error) {
    throw error;
  }
};


const deleteWorkSpace = async (id: string) => {
    try {
        const result = await prisma.workspace.delete({
            where : {
                id
            }
        });
        return result;
    } catch (error) {
        throw error;
    }
}

const updateWorkSpace = async (id : string,data : Partial<Workspace>) => {
    try {
        const result = await prisma.workspace.update({
            where : {
                id
            },
            data
        });
        return result;
    } catch (error) {
        throw error;
    }
}

export const workspaceService = {
  createWorkspace,
  getWorkSpaceById,
  getAllWorkSpaces,
  deleteWorkSpace,
  updateWorkSpace,
  getWorkSpacesByUserId,
};
