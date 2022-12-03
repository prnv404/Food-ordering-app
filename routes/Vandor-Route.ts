import express, { Request, Response, NextFunction } from 'express'
import { AddFood, GetFoods, GetVandorProfile, UpdateVandorProfile, UpdateVandorService, VandorLogin } from '../controller'
import { Authenticate } from '../middleware'



const router = express.Router()

router.post('/login', VandorLogin)

router.use(Authenticate)

router.get('/profile', GetVandorProfile)

router.patch('/profile',UpdateVandorProfile)

router.patch('/service',UpdateVandorService)

router.post('/food',AddFood)

router.get('/foods',GetFoods)

router.get('/', (req: Request, res: Response, next: NextFunction) => {

    res.json({ message: "hello from Vandor" })
    
})

export {router as VandorRoute}