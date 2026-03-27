import { Router } from "express";
import { inviteController } from "./invite.controller";

const router = Router();


router.get("/accept/:token",inviteController.acceptInvite);

export const inviteRoutes = router;