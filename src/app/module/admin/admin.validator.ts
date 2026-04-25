import z from "zod";

const updateUserSchema = z.object({
    isBlocked : z.boolean().optional(),
    blockedReason : z.string().optional(),
    isDeleted : z.boolean().optional(),
});

export const AdminValidator = {
    updateUserSchema
}