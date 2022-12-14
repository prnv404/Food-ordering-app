import { Request, Response, NextFunction } from 'express'
import { Customer, Food, Transaction, Vendor } from '../model'
import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'
import { CreateCustomerInput,LoginCustomerInput, EditCustomerProfileInput, OrderInput, CartItem } from '../dto'
import { GenerateOtp, GeneratePassword, GenerateSalt, GenerateSignature, onRequestOTP, ValidatePassword } from '../utility'
import { Order } from '../model/order'
import { Offer } from '../model/offer'


/** ------------------------ Authentication Section ----------------------------**/ 

export const CustomerSignup = async (req: Request, res: Response, next: NextFunction) => {

    const customerInput = plainToClass(CreateCustomerInput, req.body)
    
    const inputErrors = await  validate(customerInput, { validationError: { target: true } })
    
    if (inputErrors.length > 0) { 

        return res.status(400).json(inputErrors)
    }

    const { email, phone, password } = customerInput
    

    let salt = await GenerateSalt()
    

    const userPassword:string = await GeneratePassword(password, salt)


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
        await onRequestOTP(otp, phone)
        
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
        
        const validate = await ValidatePassword(password, customer.password,customer.salt)
        
        if (validate) {
            
            const signature =await  GenerateSignature({ 
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

            await onRequestOTP(otp, profile.phone)
            
            return res.status(200).json({message:"OTP Succesfully sent to your registerd number"})
        }

    }

    return res.status(400).json({message:"Error with Request OTP"})

}

/** ---------------------------------- Profile Section --------------------------------**/ 


export const GetCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {
    
    const customer = req.user

    if (customer) {
        
        const profile = await Customer.findById(customer._id)

        return res.status(200).json(profile)
    }

    return res.status(400).json({message:"Error with Profile"})

}


export const EditCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {
    
    const customer = req.user._id
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


/** ---------------------------------- Cart Section --------------------------------**/ 


export const AddToCart = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user

    const { _id, unit } = <CartItem>req.body
    
    let cartItem = Array()

    if (customer) {
        
        const profile  = await Customer.findById(customer._id).populate('cart.food')
        
     
        const food = await Food.findById(_id)
        

        if (food) {
            
            if (profile !== null) {
                
                cartItem = profile.cart

                if (cartItem.length > 0) {
                    // check and update unit

                    let existFoodItem = cartItem.filter((item) => item.food._id.toString() === _id)
                    
                    if (existFoodItem.length > 0) {
                        
                        const index = cartItem.indexOf(existFoodItem[0])

                        if (unit > 0) {
                            
                            cartItem[index] = { food, unit }
                        } else {
                            
                            cartItem.splice(index, 1)
                        }

                    } else {
                        
                        cartItem.push({food,unit})
                    }

                } else {
                    // add new item 

                    cartItem.push({food,unit})

                }

                profile.cart = cartItem as any

                const result = await profile.save()

                return res.status(201).json(result.cart)

            }
        }

    }

    return res.status(400).json({message:"Error with Add to cart"})

}

export const GetCart = async (req: Request, res: Response, next: NextFunction) => {
  
    const customer = req.user

    const profile = await Customer.findById(customer._id).populate('cart.food')

    if (profile !== null) {
        
        return res.status(200).json(profile.cart)
    }

    return res.status(400).json({message:"Error with Get the cart"})

}

export const DeleteCart = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user

    let cartItem = Array()
    
    if (customer) {
        
    const profile = await Customer.findById(customer._id).populate('cart.food')

        if (profile !== null) {
            
            profile.cart = [] as any
            
           const result = await profile.save()

           return res.status(201).json(result.cart)

        }   
    }

    return res.status(400).json({message:"Error with Delete the Cart"})

}

/** ---------------------------------- Payment Section --------------------------------**/ 


export const CreatePayment = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user

    const { amount, paymentMode, offerId } = req.body

    let payableAmount = Number(amount)

    if (offerId) {
        
        const appliedOffer = await Offer.findById(offerId)

        if (appliedOffer.isActive) {
            
            payableAmount = (payableAmount - parseInt(appliedOffer.offerAmount))

        }

    }

    // Payment GateWay charge Api call

    // Create Record on Transaction

    const transaction = await Transaction.create({

        customer: customer._id,
        vendorId: '',
        orderId: '',
        orderValue: payableAmount,
        offerUsed: offerId || 'NA',
        status: 'OPEN',
        paymentMode: paymentMode,
        paymentResponse:'Payment is Cash on delivery'
        
    })

    // return Transaction ID
    return res.status(201).json(transaction)

}

/** ------------------------ Delivery notificatin Section ----------------------------**/ 

const assignOrderForDelivery = async (orderId: string, vendorId: string) => {
    

    // find the vendor 
    const vendor = await Vendor.findById(vendorId)
   

    if (vendor) {

        const areaCode = vendor.pincode
        const vendorLag = vendor.lag
        const vendorLat = vendor.lat

         // find the available delivery person
        

        // check the nearest delivery person
        

        // update the delivery Id
       
    }
}    
 

/** ---------------------------------- Order Section --------------------------------**/ 


const validateTransaction = async (tnxId: string) => {
    
    const currentTransaction = await Transaction.findById(tnxId)

    if (currentTransaction.status.toLowerCase() !== 'failed') {
        
        return {status:true,currentTransaction}
    }

    return {status:false,currentTransaction}

}


export const CreateOrder = async (req: Request, res: Response, next: NextFunction) => {

    // Grab the customer id from request
    const customer = req.user

    const { tnxId,amount,items} = <OrderInput>req.body

    if (customer) {
        
      // create an order id
        const orderId = `${Math.floor(Math.random() * 899999) + 1000}`

        const profile  = await Customer.findById(customer._id)
        
        if (profile !== null) {            

            const { status, currentTransaction } = await validateTransaction(tnxId)
            
            if (!status) {
                
                return res.status(400).json({message:"Transaction Id is not valid"})
            }

            let cartItem = Array()

            let netAmount = 0.0

            // calculate the amount

            const foods = await Food.find().where('_id').in(items.map(item => item._id)).exec()
        
            // console.log(foods)

            let vendorId = ''

            foods.map((food) => {
            
                items.map(({ _id, unit }) => {
                
                    if (food._id == _id) {
                    
                        vendorId = food.vandorId
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
                    vendorId: vendorId,
                    
                    items: cartItem,
                    totalAmount: netAmount,
                    paidAmount:amount,
                    orderStatus: 'Waiting',
                    orderDate: Date.now(),
                    remarks: '',
                    readyTime: 45,
                    deliveryId: '',
                
                })
            
                if (currentOrder) {
                     
                    // finally update order to the user account
                    profile.cart = [] as any
                    profile?.Orders.push(currentOrder)
                    await profile?.save()

                    currentTransaction.vendorId = vendorId
                    currentTransaction.orderId = currentOrder._id
                    currentTransaction.status = 'CONFIRMED'

                    await currentTransaction.save()

                    return res.status(200).json(currentOrder)
                }
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


export const VerifyOffer = async (req: Request, res: Response, next: NextFunction) => {

    const offerId = req.params.id

    const customer = req.user

    if (customer) {
        
        const appliedOffers = await Offer.findById(offerId)

        console.log(appliedOffers)

        if (appliedOffers) {

            if (appliedOffers.promoType == "USER") {
                
            } else {

                if (appliedOffers.isActive) {
                
                    return res.status(200).json({message:"Offer is valid",appliedOffers})
                }
            }
        }
    }

    return res.status(400).json({message:"Invalid Offer"})

}

