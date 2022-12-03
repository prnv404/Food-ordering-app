import { Request, Response, NextFunction } from 'express'
import { CreateVandorInput } from '../dto'
import { Vandor } from '../model'
import { GeneratePassword, GenerateSalt } from '../utils'



export const findVandor = async (id: string | undefined, email?: string) => {
    
    if (email) {
        return await Vandor.findOne({ email })
    } else {
        return  await Vandor.findById(id) 
    }

}



export const CreateVandor = async (req: Request, res: Response, next: NextFunction) => {
    
    const { name, password, phone, foodType, ownerName, pincode, address ,email} = <CreateVandorInput>req.body
    
    const existingVandor = await findVandor('',email)
    
    if (existingVandor !== null) {
        return res.status(401).json({message:"vandor already exist with this email"})
    }

    // generate salt 
    const salt = await GenerateSalt()

    // genearte encrypt password
    
    const hashPassword = await GeneratePassword(password, salt)
    

    const createdVandor = await Vandor.create({
        name:name,
        password:hashPassword,
        phone:phone,
        foodType:foodType, 
        ownerName:ownerName,
        pincode:pincode,
        address: address,
        rating: 1,
        serviceAvailable: false, 
        coverImage: ['sample.jpg'],
        salt: salt,
        email,
        foods:[]
    })

    return res.json(createdVandor)
}


export const GetVandors = async (req: Request, res: Response, next: NextFunction) => {
    
    const vandors = await Vandor.find()

    if (!vandors) return res.status(404).json({ message: "No vandors found" })
    
    return res.status(200).json(vandors)

}



export const GetVandorById = async (req: Request, res: Response, next: NextFunction) => {
    
    const vandorId = req.params.id

    const vandor = await findVandor(vandorId)

    if (!vandor) return res.status(400).json({ message: "No vandor Found" })
    
    return res.status(200).json(vandor)

}
