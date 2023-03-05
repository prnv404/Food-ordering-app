import { Request, Response, NextFunction } from 'express'
import {  Delivery} from '../model'
import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'
import { LoginCustomerInput, EditCustomerProfileInput, CreateDeliveryUserInput } from '../dto'
import {  GeneratePassword, GenerateSalt, GenerateSignature, onRequestOTP, ValidatePassword } from '../utility'


/** ------------------------ Authentication Section ----------------------------**/ 

export const DeliverySignup = async (req: Request, res: Response, next: NextFunction) => {

    const DeliveryInput = plainToClass(CreateDeliveryUserInput, req.body)
    
    const inputErrors = await  validate(DeliveryInput, { validationError: { target: true } })
    
    if (inputErrors.length > 0) { 

        return res.status(400).json(inputErrors)
    }

    const { email, phone, password, address, firstName, lastName } = DeliveryInput
    
    
    const salt = await GenerateSalt()

    const userPassword = await GeneratePassword(password, salt)

    
    const existingDeliveryUser = await Delivery.findOne({ email })
    
    if (existingDeliveryUser) {
        
        return res.status(400).json({message:"email already exist"})
    }

    const result = await Delivery.create({
        email: email,
        phone: phone,
        password: userPassword,
        salt: salt,
        firstName: firstName,
        lastName: lastName,
        verified: false,
        addresss:address,
        lat: 0,
        lng: 0,
        isAvailable: false

    })

    if (result) {
      
        
        // Generate Signature
        const signature = await GenerateSignature({ 
            email: email,
            _id: result._id,
            verified: result.verified
        })
        console.log(result.verified)
        // Send the Result to client
        return res.status(201).json({signature,verified:result.verified,email:result.email})
        
    }

    return res.status(400).json({message:"Error with Signup"})
}


export const DeliveryLogin = async (req: Request, res: Response, next: NextFunction) => {
    
    const LoginInput = plainToClass(LoginCustomerInput, req.body)

    const inputErrors = await validate(LoginInput, { validationError: { target: true } })
    
    if (inputErrors.length > 0) {

        return res.status(400).json(inputErrors)
        
    }

    const { email, password } = LoginInput
    
    const user = await Delivery.findOne({ email })
    
    if (user) {
        
        const validate = await ValidatePassword(password, user.password,user.salt)
        
        if (validate) {
            
            const signature = await GenerateSignature({ 
                email: email,
                _id: user._id,
                verified: user.verified
            })

        return res.status(201).json({signature,verified:user.verified,email:user.email})

        }

    }

    return res.status(404).json({message:"Error with login"})

}




/** ---------------------------------- Profile Section --------------------------------**/ 


export const GetDeliveryProfile = async (req: Request, res: Response, next: NextFunction) => {
    
    const DeliveryUser = req.user

    if (DeliveryUser) {
        
        const profile = await Delivery.findById(DeliveryUser._id)

        return res.status(200).json(profile)
    }

    return res.status(400).json({message:"Error with Profile"})

}


export const EditDeliveryProfile = async (req: Request, res: Response, next: NextFunction) => {
    
    const DeliveryUser = req.user._id
   

    const EditProfileInput = plainToClass(EditCustomerProfileInput, req.body)

    const inputErrors = await validate(EditProfileInput, { validationError: { target: true } })

    if (inputErrors.length > 0) {
        
        return res.status(400).json(inputErrors)
    }

    const { lastName, firstName, address } = EditProfileInput
    
    const profile = await Delivery.findById(DeliveryUser)


    if (profile) {
        
        profile.firstName = firstName
        profile.lastName = lastName
        profile.address = address

        const result = await profile.save()

        return res.status(201).json(result)
    }

    return res.status(400).json({message:"Error with updating Pofile"})

}


export const UpdateDeliveryUserStatus = async (req: Request, res: Response, next: NextFunction) => {

    const DeliveryUser = req.user

    if (DeliveryUser) {
        
        const { lng, lat } = req.body
        
        const profile = await Delivery.findById(DeliveryUser._id)

        if (profile) {
            
            if (lat && lng) {
                
                profile.lng = lng
                profile.lat = lat
            }

            profile.isAvailable = !profile.isAvailable

            const result = await profile.save()
    
            return res.status(200).json({result})
          
        }

      
    }

    return res.status(400).json({message:"Error with updating Service"})

}