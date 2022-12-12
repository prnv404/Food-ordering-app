import { Request, Response, NextFunction } from 'express'
import { CreateVendorInput } from '../dto'
import { Transaction, Vendor } from '../model'
import { GeneratePassword, GenerateSalt } from '../utility'



export const findVendor = async (id: string | undefined, email?: string) => {
    
    if (email) {
        return await Vendor.findOne({ email })
    } else {
        return  await Vendor.findById(id) 
    }

}



export const CreateVendor = async (req: Request, res: Response, next: NextFunction) => {
    
    const { name, password, phone, foodType, ownerName, pincode, address ,email} = <CreateVendorInput>req.body
    
    const existingVendor = await findVendor('',email)
    
    if (existingVendor !== null) {
        return res.status(401).json({message:"vandor already exist with this email"})
    }

    // generate salt 

    const salt = await GenerateSalt()

    // genearte encrypt password
    
    const hashPassword = await GeneratePassword(password, salt)
    

    const createdVendor = await Vendor.create({
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
        foods: [],
        lag: 0,
        lat:0
    })

    return res.json(createdVendor)

}




export const GetVendors = async (req: Request, res: Response, next: NextFunction) => {
    
    const vendors = await Vendor.find()

    if (!vendors) return res.status(404).json({ message: "No vendors found" })
    
    return res.status(200).json(vendors)

}



export const GetVendorById = async (req: Request, res: Response, next: NextFunction) => {
    
    const vendorId = req.params.id

    const vendor = await findVendor(vendorId)

    if (!vendor) return res.status(400).json({ message: "No vendor Found" })
    
    return res.status(200).json(vendor)

}

export const GetTransactions = async (req: Request, res: Response, next: NextFunction) => {
    
    const transactions = await Transaction.find()

    if (transactions !== null) {
        
        return res.status(200).json(transactions)
    }
    
    return res.status(400).json({ message: "No Transaction Found" })
}



export const GetTransactionById = async (req: Request, res: Response, next: NextFunction) => {
    
    const tnxId = req.params.id

    const transaction = await Transaction.findById(tnxId)

    if (transaction !== null) {
        
        return res.status(200).json(transaction)
    }
    
    return res.status(400).json({ message: "No Transaction Found" })

}