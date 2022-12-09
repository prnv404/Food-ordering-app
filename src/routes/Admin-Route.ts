import express, { Request, Response, NextFunction } from "express"

import { CreateVendor, GetVendorById, GetVendors } from "../controller"


const router = express.Router()

router.post("/vandor", CreateVendor)

router.get('/vandors', GetVendors)

router.get('/vandor/:id', GetVendorById)


export { router as AdminRoute }
