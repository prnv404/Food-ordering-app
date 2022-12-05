import express, { Request, Response, NextFunction } from 'express'
import { CreateOrder, CustomerLogin, CustomerSignup, CustomerVerify, EditCustomerProfile, GetCustomerProfile, GetOrderById, GetOrders, RequestOtp } from '../controller'
import { Authenticate } from '../middleware'

const router = express.Router()

/* ----------------------- Signup / CreateCustomer--------------------------- */
 
router.post('/signup',CustomerSignup)

/* ----------------------- Login --------------------------- */

router.post('/login',CustomerLogin)


// Authentication

router.use(Authenticate)
/* ----------------------- Verify Customer Account --------------------------- */

router.patch('/verify',CustomerVerify)

/* ----------------------- OTP / Requesting --------------------------- */

router.get('/otp',RequestOtp)

/* ----------------------- Profile --------------------------- */

router.get('/profile',GetCustomerProfile)

router.patch('/profile',EditCustomerProfile)


// Cart

// Order

router.post('/create-order', CreateOrder)

router.get('/orders', GetOrders)

router.get('/order/:id', GetOrderById)

// Payment



export {router as CustomerRoute}