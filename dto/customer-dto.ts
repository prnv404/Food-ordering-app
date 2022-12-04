import { IsEmail, IsEmpty, Length } from 'class-validator'


export class CreateCustomerInput  {

    @IsEmail()
    email: string
    
    password: string
    
    @Length(10, 12)   
    phone: string
    
}

export class LoginCustomerInput  {

    @IsEmail()
    email: string
    
    @Length(5, 12)  
    password: string
    
    
}

export class EditCustomerProfileInput  {

    @Length(3, 20)
    firstName: string
    
    @Length(1, 12)  
    lastName:string
    
    @Length(3, 20)
    address: string
    
}

export interface CustomerPayload {

    email: string,
     _id: string,
    verified: boolean
    
}