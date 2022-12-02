import express, { Request, Response, NextFunction } from 'express'
import { GetVandorProfile, UpdateVandorProfile, UpdateVandorService, VandorLogin } from '../controller'


const router = express.Router()

router.post('/login', VandorLogin)

router.get('/profile',GetVandorProfile)

router.patch('/profile',UpdateVandorProfile)

router.patch('/service',UpdateVandorService)



router.get('/', (req: Request, res: Response, next: NextFunction) => {

    res.json({ message: "hello from Vandor" })
    
})

export {router as VandorRoute}