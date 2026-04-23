import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { dashboardServices } from "./dashboard.services";
import { IRequestUser } from "../../middleware/checkAuth";
import { sendResponse } from "../../shared/sendResponse";

const dashboardForSoloUser = catchAsync(async (req: Request, res: Response) => {
  const result = await dashboardServices.dashboardForSoloUser(
    req.user as IRequestUser,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Dashboard fetched successfully",
    data: result,
  });
});

const dashboardForTeamUser = catchAsync(async (req: Request, res: Response) => {
  const result = await dashboardServices.dashboardForTeamUser(
    req.params.workspaceId as string,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Dashboard fetched successfully",
    data: result,
  });
});

const dashboardForSuperAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await dashboardServices.dashboardForSuperAdmin(
    req.user as IRequestUser,
  );
  sendResponse(res, {
    statusCode: 200,
    message : "Dashboard fetched successfully",
    success : true,
    data : result
  })
})

const getFullYearProfit = catchAsync(async (req: Request, res: Response) => {
  const result = await dashboardServices.getFullYearProfit();
  sendResponse(res, {
    statusCode: 200,
    message : "Yearly profit fetched successfully",
    success : true,
    data : result
  })
})

const userGrowth = catchAsync(async (req: Request, res: Response) => {
  const result = await dashboardServices.userGrowth();
  sendResponse(res, {
    statusCode: 200,
    message : "User growth fetched successfully",
    success : true,
    data : result
  })
})



export const dashboardController = {
  dashboardForSoloUser,
  dashboardForTeamUser,
  dashboardForSuperAdmin,
  getFullYearProfit,
  userGrowth
};