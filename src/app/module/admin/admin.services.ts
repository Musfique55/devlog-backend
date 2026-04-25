import { email } from "zod";
import { APP_ROLE, Prisma } from "../../../generated/prisma/client";
import { WorkspaceFindManyArgs } from "../../../generated/prisma/models";
import { prisma } from "../../../lib/prisma";
import AppError from "../../helper/AppError";
import { IQueryParams } from "../../types/queryBuilder.types";
import { QueryBuilder } from "../../utils/queryBuilder";

interface IUpdateUserActivityStatus {
  isBlocked: boolean;
  blockedReason?: string;
  isDeleted?: boolean;
}

const getAllUsers = async (query: IQueryParams) => {
  try {
    const filterableFields = ["isBlocked", "isDeleted"];
    const filterHistory: Record<string, any> = {
      role: {
        not: APP_ROLE.SUPER_ADMIN,
      },
    };
    for (const key of Object.keys(query)) {
      if (filterableFields.includes(key)) {
        filterHistory[key] = query[key] === "true" ? true : false;
      }
    }
    const queryBuilder = new QueryBuilder<Prisma.UserFindManyArgs>(query)
      .paginate()
      .filter({ ...filterHistory })
      .include("workspaces", ["workspaces"])
      .sort()
      .search(["name", "email"]);

    const [data, total] = await Promise.all([
      prisma.user.findMany(queryBuilder.build()),
      prisma.user.count(queryBuilder.count()),
    ]);

    return {
      data,
      meta: {
        total,
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 10,
        totalPages: Math.ceil(total / Number(query.limit)),
      },
    };
  } catch (error: any) {
    throw error;
  }
};

const updateUserActivityStatus = async (
  userId: string,
  payload: IUpdateUserActivityStatus,
) => {
  try {
    const { isBlocked, blockedReason, isDeleted } = payload;
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
        blockedAt: isBlocked ? new Date() : null,
        blockedReason: isBlocked ? blockedReason || "No reason provided" : null,
        isDeleted: isDeleted || false,
        deletedAt: isDeleted ? new Date() : null,
      },
    });
  } catch (error) {
    throw error;
  }
};

const getAllWorkSpaces = async (query: IQueryParams) => {
  try {
    const additionalFilter: Prisma.WorkspaceWhereInput[] = [];
    if (query.searchTerm) {
      additionalFilter.push({
        name: {
          contains: query.searchTerm,
          mode: "insensitive",
        },
      });
    }

    if (query) {
      if (query.isActive === "true") {
        additionalFilter.push({
          isActive: true,
        });
      } else if (query.isActive === "false") {
        additionalFilter.push({
          isActive: false,
        });
      }
    }

    const [data, count] = await Promise.all([
      prisma.workspace.findMany({
        where: {
          AND: {
            ...(query.isActive && {isActive: query.isActive === "true" ? true : false}),
            ...(additionalFilter.length > 0 && { OR: additionalFilter }),
          },
        },
        omit: {
          adminId: true,
        },
        include: {
          admin: {
            select: {
              name: true,
              email: true,
              id: true,
              image: true,
            },
          },
          _count: {
            select: {
              members: true,
              logs: true,
            },
          },
        },
        orderBy: {
          [query.sortBy || "createdAt"]:
            query.sortOrder === "asc" ? "asc" : "desc",
        },
        skip: (Number(query.page) - 1) * Number(query.limit) || 0,
        take: Number(query.limit) || 10,
      }),

      prisma.workspace.count({
        where: {
          ...(additionalFilter.length > 0 && { OR: additionalFilter }),
          AND: {
            isDeleted: false,
            isActive: true,
          },
        },
      }),
    ]);

    const formattedData = data.map((workspace) => {
      const { _count, ...rest } = workspace;
      return {
        ...rest,
        memberCount: workspace._count.members,
        logCount: workspace._count.logs,
      };
    });

    return {
      data: formattedData,
      meta: {
        total: count,
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 10,
        totalPages: Math.ceil(count / Number(query.limit || 10)),
      },
    };
  } catch (error) {
    throw error;
  }
};

export const AdminService = {
  getAllUsers,
  updateUserActivityStatus,
  getAllWorkSpaces,
};
