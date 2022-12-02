import express, { Request, Response, NextFunction } from "express"

import { CreateVandor, GetVandorById, GetVandors } from "../controller"


const router = express.Router()


router.post("/vandor", CreateVandor)

router.get('/vandors', GetVandors)

router.get('/vandor/:id',GetVandorById)

router.get("/", (req: Request, res: Response, next: NextFunction) => {

    res.json({ message: "hello from Admin" })

})

export { router as AdminRoute }
