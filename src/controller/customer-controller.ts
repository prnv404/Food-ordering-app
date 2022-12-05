import { Request, Response, NextFunction } from 'express'
import { Customer, Food } from '../model'
import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'
import { CreateCustomerInput,LoginCustomerInput, EditCustomerProfileInput, OrderInput } from '../dto'
import { GenerateOtp, GeneratePassword, GenerateSalt, GenerateSignature, onRequestOtp, validatePassword } from '../utils'
import { Order } from '../model/order'




export const CustomerSignup = async (req: Request, res: Response, next: NextFunction) => {

    const customerInput = plainToClass(CreateCustomerInput, req.body)
    
    const inputErrors = await  validate(customerInput, { validationError: { target: true } })
    
    if (inputErrors.length > 0) { 

        return res.status(400).json(inputErrors)
    }

    const { email, phone, password } = customerInput
    
    const salt = await GenerateSalt()

    const userPassword = await GeneratePassword(password, salt)


    const { otp, expiry } = GenerateOtp()
    
    const existCustomer = await Customer.findOne({ email })
    
    if (existCustomer) {
        
        return res.status(400).json({message:"email already exist"})
    }

    const customer = await Customer.create({
        email: email,
        phone: phone,
        password: userPassword,
        salt: salt,
        firstName: '',
        lastName: '',
        verifed: false,
        otp: otp,
        otp_expiry:expiry,
        lat: 0,
        lng: 0,
        Orders:[]
    })

    if (customer) {
        
        // Send OTP to customer
        await onRequestOtp(otp, phone)
        
        // Generate Signature
        const signature = GenerateSignature({ 
            email: email,
            _id: customer._id,
            verified: customer.verifed
        })
        // Send the Result to client
        return res.status(201).json({signature,verified:customer.verifed,email:customer.email})
        
    }

    return res.status(400).json({message:"Error with Signup"})
}


export const CustomerLogin = async (req: Request, res: Response, next: NextFunction) => {
    
    const LoginInput = plainToClass(LoginCustomerInput, req.body)

    const inputErrors = await validate(LoginInput, { validationError: { target: true } })
    
    if (inputErrors.length > 0) {

        return res.status(400).json(inputErrors)
        
    }

    const { email, password } = LoginInput
    
    const customer = await Customer.findOne({ email })
    
    if (customer) {
        
        const validate = await validatePassword(password, customer.password,customer.salt)
        
        if (validate) {
            
            const signature = GenerateSignature({ 
                email: email,
                _id: customer._id,
                verified: customer.verifed
            })

        return res.status(201).json({signature,verified:customer.verifed,email:customer.email})

        }

    }

    return res.status(404).json({message:"Error with login"})

}


export const CustomerVerify = async (req: Request, res: Response, next: NextFunction) => {
    
    const { otp } = req.body
    
    const customer = req.user

    if (customer) {
        
        const profile = await Customer.findById(customer._id)

        if (profile) {
 
            if (profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()) {

                profile.verifed = true

                const updatedCustomerResponse = await profile.save()

                const signature = GenerateSignature({ 
                    email: updatedCustomerResponse.email,
                    _id: updatedCustomerResponse._id,
                    verified: updatedCustomerResponse.verifed
                })

        return res.status(201).json({signature,verified:updatedCustomerResponse.verifed,email:updatedCustomerResponse.email})

            }
        }

    }

    return res.status(400).json({message:"Error with Verify"})

}


export const RequestOtp = async (req: Request, res: Response, next: NextFunction) => {
    
    const customer = req.user

    if (customer) {
        
        const profile = await Customer.findById(customer._id)

        if (profile) {
            
            const { otp, expiry } = GenerateOtp()
            
            profile.otp = otp

            profile.otp_expiry = expiry

            await profile.save()

            await onRequestOtp(otp, profile.phone)
            
            return res.status(200).json({message:"OTP Succesfully sent to your registerd number"})
        }

    }

    return res.status(400).json({message:"Error with Request OTP"})

}


export const GetCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {
    
    const customer = req.user

    if (customer) {
        
        const profile = await Customer.findById(customer._id)

        return res.status(200).json(profile)
    }

    return res.status(400).json({message:"Error with Profile"})

}


export const EditCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {
    
    const customer = req.user?._id
    console.log(customer)

    const EditProfileInput = plainToClass(EditCustomerProfileInput, req.body)

    const inputErrors = await validate(EditProfileInput, { validationError: { target: true } })

    if (inputErrors.length > 0) {
        
        return res.status(400).json(inputErrors)
    }

    const { lastName, firstName, address } = EditProfileInput
    
    const profile = await Customer.findById(customer)


    if (profile) {
        
        profile.firstName = firstName
        profile.lastName = lastName
        profile.address = address

        const result = await profile.save()

        return res.status(201).json(result)
    }

    return res.status(400).json({message:"Error with updating Pofile"})

}


export const CreateOrder = async (req: Request, res: Response, next: NextFunction) => {

    // Grab the customer id from request
    const customer = req.user

    if (customer) {
        
      // create an order id
        const orderId = `${Math.floor(Math.random() * 899999) + 1000}`

        const profile  = await Customer.findById(customer._id)
        
        if (profile !== null) {
            
        }

       // Grab the order items form request [{ id:xx , unit: xx}]
        const cart = <[OrderInput]>req.body 

        // console.log(cart)

        let cartItem = Array()

        let netAmount = 0.0

     // calculate the amount

        const foods = await Food.find().where('_id').in(cart.map(item => item._id)).exec()
        
        // console.log(foods)

        foods.map((food) => {
            
            cart.map(({ _id, unit }) => {
                
                if (food._id == _id) {
                    
                    netAmount += (food.price * unit)
                    cartItem.push({ food, unit })
                    
                }
            })
        })
        

       // create order with discription
        
        if (cartItem) {
            
            // console.log(cartItem)
            const currentOrder = await Order.create({
                OrderId: orderId,
                items: cartItem,
                totalAmount: netAmount,
                paidThrough: 'COD',
                paymentResponse: '',
                orderStatus: 'Waiting',
                orderDate:  Date.now()
                
            })
            
            if (currentOrder) {
                     
             // finally update order to the user account
                
                profile?.Orders.push(currentOrder)
               await profile?.save()

                return res.status(200).json(currentOrder)
            }
        }
   

    }
   
}


export const GetOrders = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user

    if (customer) {

        const profile = await Customer.findById(customer._id).populate('Orders')

        return res.status(200).json(profile)

    }
}


export const GetOrderById = async (req: Request, res: Response, next: NextFunction) => {

    const orderId = req.params.id


    if (orderId) {

        const profile = await Order.findById(orderId).populate('items.food')

        return res.status(200).json(profile)

    }
}
