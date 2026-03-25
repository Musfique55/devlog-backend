import z from "zod";


const validateWorkSpaceCreate = z.object({
    name : z.string(
        "name is required",
    ).max(20,"name must be less than 20 characters")
})

const validateWorkSpaceUpdate = z.object({
    name : z.string(
        "name is required",
    ).max(20,"name must be less than 20 characters")
})

export const workspaceValidation = {
    validateWorkSpaceCreate,
    validateWorkSpaceUpdate
}