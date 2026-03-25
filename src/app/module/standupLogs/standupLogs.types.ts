import { TEAM_ROLE } from "../../../generated/prisma/enums";

export interface ICreateLogs {
    todayWork : string;
    tomorrowWork : string;
    blocker? : string;
    projectTag? : string;
    workspaceId? : string;
    role : TEAM_ROLE
}

