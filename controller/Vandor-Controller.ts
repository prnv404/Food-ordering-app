import { Request, Response, NextFunction } from 'express'
import { VandorLoginInput } from '../dto'
import { Vandor } from '../model'
import { GenerateSignature, validatePassword } from '../utils'
import { findVandor } from './Admin-Controller'


export const VandorLogin = async (req: Request, res: Response, next: NextFunction) => {
    
    const { password, email } =<VandorLoginInput>req.body
    
    const existingVandor = await findVandor('', email)
    
    if (!existingVandor) return res.status(401).json({ message: "No Vandor found" })
    
    const validation = await validatePassword(password,existingVandor.password,existingVandor.salt)

    if (validation) { 

        const signature = GenerateSignature({
            _id: existingVandor._id,
            name: existingVandor.name,
            email: existingVandor.email,
            foodType:existingVandor.foodType
        })

        // console.log(signature)
        return res.status(200).json(signature)
    } else {

        return res.status(400).json({message:"Password incorrect"})
    }
}

export const GetVandorProfile = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user

    if (user) {
        const existingVandor = await findVandor(user._id)
        res.json(existingVandor)
    } else {
        res.json({
            message:"No Vandor found"})
    }
}

export const UpdateVandorProfile = async (req: Request, res: Response, next: NextFunction) => {
    
}

export const UpdateVandorService = async (req: Request, res: Response, next: NextFunction) => {
    
}