
import { APP_ROLE, PaymentStatus, PLAN } from "../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma";
import AppError from "../../helper/AppError";
import { IRequestUser } from "../../middleware/checkAuth";
import { getMonthName } from "../../utils/getMonthName";

const dashboardForSoloUser = async (loggedUser: IRequestUser) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStart = new Date(today);
    //saturday will be first day of week
    weekStart.setDate(today.getDate() - today.getDay());

    const [user, totalLogs, thisWeekLogs, recentLogs] = await Promise.all([
      prisma.user.findUnique({
        where: {
          id: loggedUser.id,
        },
        select: {
          currentStreak: true,
          longestStreak: true,
          plan: true,
          lastLogDate: true,
        },
      }),
      prisma.standupLogs.count({
        where: {
          userId: loggedUser.id,
          workspaceId: {
            equals: null,
          },
        },
      }),

      prisma.standupLogs.count({
        where: {
          userId: loggedUser.id,
          createdAt: {
            gte: weekStart,
          },
        },
      }),

      prisma.standupLogs.findMany({
        where: {
          userId: loggedUser.id,
          workspaceId: {
            equals: null,
          },
        },
        take: 3,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          todayWork: true,
          tomorrowWork: true,
          blocker: true,
          projectTags: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      currentStreak: user?.currentStreak ?? 0,
      longestStreak: user?.longestStreak ?? 0,
      lastLogDate: user?.lastLogDate ?? null,
      plan: user?.plan,
      totalLogs,
      thisWeekLogs,
      recentLogs,
    };
  } catch (error) {
    throw error;
  }
};

const dashboardForTeamUser = async (workspaceId: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  try {
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
        isActive: true,
        isDeleted: false,
      },
      include: {
        members: {
          where: {
            role: "MEMBER",
          },
          include: {
            user: true,
          },
        },
        logs: {
          where: {
            createdAt: {
              gte: weekStart,
            },
          },
        },
      },
    });

    if (!workspace) throw new AppError("Workspace not found", 404);

    return {
      totalMembers: workspace.members.length,
      totalLogsThisWeek: workspace.logs.length,
      membersActivity: workspace.members.map((member) => {
        return {
          name: member.user.name,
          logCount: workspace.logs.filter((l) => l.userId === member.user.id)
            .length,
          currentStreak: member.user.currentStreak,
          hasBlocker: workspace.logs.filter(
            (l) => l.userId === member.user.id && l.blocker,
          ).length,
        };
      }),
      recentBlockers: workspace.logs.slice(0, 5).filter((l) => l.blocker),
      topStreak: workspace.members.reduce(
        (prev, curr) =>
          curr.user.currentStreak > prev.streak
            ? { name: curr.user.name, streak: curr.user.longestStreak }
            : prev,
        { name: "", streak: 0 },
      ),
    };
  } catch (error) {
    throw error;
  }
};


const dashboardForSuperAdmin = async (user: IRequestUser) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() - 1);
  weekStart.setHours(0, 0, 0, 0);

  try {
    const loggedInUser = await prisma.user.findUnique({
      where: {
        id: user.id,
        role: APP_ROLE.SUPER_ADMIN,
      },
    });

    if (!loggedInUser) {
      throw new AppError("You are not authorized to perform this action", 401);
    }

    const [
      totalUsers,
      totalWorkspaces,
      totalLogs,
      proUsers,
      freeUsers,
      newUsersThisWeek,
      currentMonthRevenue
    ] = await Promise.all([
      prisma.user.count(),
      prisma.workspace.count(),
      prisma.standupLogs.count(),
      prisma.user.count({
        where: {
          plan: PLAN.PRO,
          role : APP_ROLE.USER
        },
      }),
      prisma.user.count({
        where: {
          plan: PLAN.FREE,
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: weekStart,
          },
        },
      }),
      prisma.payment.aggregate({
        where : {
          createdAt : {
            gte : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        _sum : {
          amount : true
        }
      })
    ]);

    return {
      totalUsers,
      totalWorkspaces,
      totalLogs,
      proUsers,
      freeUsers,
      newUsersThisWeek,
      monthlyRevenue : currentMonthRevenue._sum.amount || 0
    };
  } catch (error) {
    throw error;
  }
};


const getFullYearProfit = async () => {
  // const data = await prisma.payment.groupBy({
  //   by: ['createdAt'] ,
  //   _sum: {
  //     amount: true,
  //   },
  //   where : {
  //     createdAt : {
  //       gte : new Date(new Date().getFullYear(), 0, 1),
  //       lte : new Date(new Date().getFullYear(), 11, 31)
  //     },
  //     status : PaymentStatus.SUCCESS
  //   }
  // })

  // const formattedData = data.map(item => {
  //   return {
  //     month : getMonthName(item.createdAt.getMonth() + 1),
  //     profit : item._sum.amount || 0,
  //     revenue : item._sum.amount || 0
  //   }
  // })
  // return formattedData;  

  // for less data using this method

  const payments = await prisma.payment.findMany({
    where : {
      createdAt : {
        gte : new Date(new Date().getFullYear(), 0, 1),
        lte : new Date(new Date().getFullYear(), 11, 31)
      },
      status : PaymentStatus.SUCCESS
    }
  });

  const months = Array.from({ length: 12 }, (_, i) => {
    return {
      month: getMonthName(i + 1),
      profit: 0,
      revenue: 0,
    };
  });
    
  payments.forEach(payment => {
    const monthIndex = payment.createdAt.getMonth();
    months[monthIndex]!.profit += payment.amount;
    months[monthIndex]!.revenue += payment.amount;
  });

  return months;
}


const userGrowth = async () => {
  const now = new Date();

  const weeks = Array.from({ length: 8 }, (_, i) => {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (7 * (7-i)));
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    return { weekStart, weekEnd, label : `Week ${i + 1}` };
  });

  const growthData = await Promise.all(
    weeks.map(async ({ weekStart, weekEnd, label }) => {

      const [active, inActive] = await Promise.all([
        prisma.user.count({
          where: {
            createdAt: {
              gte: weekStart,
              lt: weekEnd,
            },
            isBlocked : false,  
            isDeleted : false,
            role : APP_ROLE.USER
          },
        }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: weekStart,
              lt: weekEnd,
            },
            isBlocked : true,
            isDeleted : false,
            role : APP_ROLE.USER
          },
        }),
      ]);


      return {
        week: label,
        active,
        inActive,
      };
    }),
  );

  return growthData;

}

export const dashboardServices = {
  dashboardForSoloUser,
  dashboardForTeamUser,
  dashboardForSuperAdmin,
  getFullYearProfit,
  userGrowth
};
