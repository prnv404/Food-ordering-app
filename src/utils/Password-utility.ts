import bcrypt from 'bcrypt'
import { Request } from 'express'
import jwt from 'jsonwebtoken'
import { APP_SECRET } from '../config'
import { CustomerPayload, VendorPayload } from '../dto'
import { AuthPayload } from '../dto/Auth-Dto'

export const GenerateSalt = async () => {

    return await bcrypt.genSalt()

}

export const GeneratePassword = async (password: string, salt: string) => {
    
    return await bcrypt.hash(password, salt)
    
}

export const validatePassword = async (enterdPassword: string, savePassword: string,salt:string) => {
    
    return await GeneratePassword(enterdPassword,salt) === savePassword
}

export const GenerateSignature =  (payload: VendorPayload|CustomerPayload) => {
    
    return  jwt.sign(payload, APP_SECRET, { expiresIn: '1d' })
    
}

export const ValidateSignature = async (req: Request) => {
    
    const signature = req.get('Authorization')

    if (signature) {
        
        const payload =  jwt.verify(signature.split(' ')[1], APP_SECRET) as AuthPayload
        
        req.user = payload 

        return true
    }

    return false
}