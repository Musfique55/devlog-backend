import z from "zod";

const loginSchema = z.object({
    email : z.string().email(),
    password : z.string().min(6),
});

const registerSchema = z.object({
    name : z.string().min(2).max(100),
    email : z.string().email(),
    password : z.string().min(6),
    inviteToken : z.string().optional()
});

const updateProfileSchema = z.object({
    name : z.string().min(2).max(100).optional(),
    image : z.url().optional(),
});


export const authSchemas = {
    loginSchema,
    registerSchema,
    updateProfileSchema
}