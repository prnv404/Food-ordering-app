import express from "express";
import { DeliveryLogin, DeliverySignup, EditDeliveryProfile, GetDeliveryProfile, UpdateDeliveryUserStatus } from "../controller";

import { Authenticate } from "../middleware";

const router = express.Router();

/* ----------------------- Signup / CreateCustomer--------------------------- */

router.post("/signup",DeliverySignup);

/* ----------------------- Login --------------------------- */

router.post("/login",DeliveryLogin);

// Authentication

router.use(Authenticate);

/* ----------------------- change Service Status --------------------------- */

router.put('/change-status',UpdateDeliveryUserStatus)

/* ----------------------- Profile --------------------------- */

router.get("/profile",GetDeliveryProfile);

router.patch("/profile",EditDeliveryProfile);



export { router as DeliveryRoute };