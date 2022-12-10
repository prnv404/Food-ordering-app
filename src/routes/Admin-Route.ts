import express, { Request, Response, NextFunction } from "express"

import { CreateVendor, GetTransactionById, GetTransactions, GetVendorById, GetVendors } from "../controller"


const router = express.Router()

router.post("/vandor", CreateVendor)

router.get('/vandors', GetVendors)

router.get('/vandor/:id', GetVendorById)

router.get('/transactions', GetTransactions)

router.get('/transaction/:id', GetTransactionById)

export { router as AdminRoute }
