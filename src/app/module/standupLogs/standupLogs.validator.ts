import z from "zod";

 const createLogSchema = (plan : "FREE" | "PRO") => {
  return z
    .object({
      todayWork: z.string().min(1),
      tomorrowWork: z.string().min(1),
      blocker: z.string().optional(),
      projectTags: z.array(z.string()).optional(),
      workspaceId: z.string().optional(),
      blockerUrl: z.array(z.string()).optional(),
    })
    .refine((data) => {
        if(plan === "FREE"){
            // free users : max 2 tags
            return (data.projectTags?.length ?? 0) <= 2;
        }else{
            // pro users : max 5 tags
            return (data.projectTags?.length ?? 0) <= 5;
        }
    },
    {
        message : "Free users can have max 2 tags and Pro users can have max 5 tags",
        path : ["projectTags"]
    }
);
};

export const logValidator = {
    createLogSchema
}
