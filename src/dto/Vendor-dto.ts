export interface CreateVandorInput {

    name: string
    ownerName: string
    foodType: [string]
    pincode: string
    address: string
    phone: string
    email: string
    password: string
    
}

export interface VandorLoginInput {

    email: string
    password: string
    
}

export interface VandorPayload {
    email: string
    name: string
    _id: string
    foodType:[string]
}

export interface EditVandorInput {
    address:string
    name: string
    foodType: [string]
    phone:string
}