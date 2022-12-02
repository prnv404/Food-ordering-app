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


/**
 * It creates a new vandor in the database
 * @param {Request} req - The request object. This contains information about the HTTP request that
 * raised the event.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next function to be called in the middleware chain.
 */
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
        coverImage: [],
        salt: salt,
        email
    })

    return res.json(createdVandor)
}


/**
 * It gets all the vandors from the database and returns them in a json format
 * @param {Request} req - Request - This is the request object that contains all the information about
 * the request that was made to the server.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - NextFunction - This is a function that we can call to pass control to
 * the next middleware function in line.
 * @returns An array of vandors
 */
export const GetVandors = async (req: Request, res: Response, next: NextFunction) => {
    
    const vandors = await Vandor.find()

    if (!vandors) return res.status(404).json({ message: "No vandors found" })
    
    return res.status(200).json(vandors)

}


/**
 * It takes a vandor id from the request params, finds the vandor in the database, and returns the
 * vandor if it exists
 * @param {Request} req - Request - This is the request object that contains all the information about
 * the request that was made to the server.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - This is a function that we call if we want to move on to the next
 * middleware in line.
 */
export const GetVandorById = async (req: Request, res: Response, next: NextFunction) => {
    
    const vandorId = req.params.id

    const vandor = await findVandor(vandorId)

    if (!vandor) return res.status(400).json({ message: "No vandor Found" })
    
    return res.status(200).json(vandor)

}
