import z from "zod";

const updateUserSchema = z.object({
    isBlocked : z.boolean().optional(),
    blockedReason : z.string().optional(),
    isDeleted : z.boolean().optional(),
});

const updateProfileSchema = z.object({
    name : z.string().min(2).max(100).optional(),
    image : z.url().optional(),
});

export const userValidator = {
    updateUserSchema,
    updateProfileSchema
}