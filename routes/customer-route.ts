import express, { Request, Response, NextFunction } from 'express'
import { CustomerLogin, CustomerSignup, CustomerVerify, EditCustomerProfile, GetCustomerProfile, RequestOtp } from '../controller'
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

// Payment



export {router as CustomerRoute}