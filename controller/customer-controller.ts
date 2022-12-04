import { Request, Response, NextFunction } from 'express'
import { Customer } from '../model'
import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'
import { CreateCustomerInput,LoginCustomerInput, EditCustomerProfileInput } from '../dto'
import { GenerateOtp, GeneratePassword, GenerateSalt, GenerateSignature, onRequestOtp, validatePassword } from '../utils'



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
        lng:0
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
