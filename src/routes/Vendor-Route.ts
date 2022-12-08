import express, { Request, Response, NextFunction } from 'express'
import { AddFood, AddOffer, EditOffer, GetCurrentOrders, GetFoods, GetOffer, GetOrderDetails, GetVandorProfile, ProcessOrder, UpdateCoverImage, UpdateVandorProfile, UpdateVandorService, VandorLogin } from '../controller'
import { Authenticate } from '../middleware'
import multer from 'multer'


const imageStorage = multer.diskStorage({

    destination: function (req, file, cb) {
       cb(null,'src/image')
    },

    filename: function (req, file, cb) {
        cb(null,new Date().toISOString()+'_'+file.originalname)
    }

})


const images =  multer({ storage: imageStorage }).array('images', 10)


const router = express.Router()

router.post('/login', VandorLogin)

router.use(Authenticate)

router.get('/profile', GetVandorProfile)

router.patch('/profile', UpdateVandorProfile)

router.patch('/service', UpdateVandorService)

// Foods

router.post('/food', images, AddFood)

router.get('/foods', GetFoods)

router.patch('/cover', images, UpdateCoverImage)

// Orders

router.get('/orders',GetCurrentOrders)

router.put('/order/:id/process',ProcessOrder)

router.get('/order/:id', GetOrderDetails)


// Offers 

router.get('/order',GetOffer)

router.post('/order',AddOffer)

router.put('/order/:id',EditOffer)


// delete offer


router.get('/', (req: Request, res: Response, next: NextFunction) => {

    res.json({ message: "hello from Vandor" })
    
})

export {router as VandorRoute}