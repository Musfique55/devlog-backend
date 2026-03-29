

export interface ICreateLogs {
    todayWork : string;
    tomorrowWork : string;
    blocker? : string;
    projectTag? : string;
    workspaceId? : string;
    blockerUrl? : string[];
}
export interface IUpdateLogs {
    todayWork : string;
    tomorrowWork : string;
    blocker? : string;
    projectTag? : string;
}

