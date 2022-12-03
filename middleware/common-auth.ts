import { NextFunction, Request, Response } from "express";
import { AuthPayload } from "../dto/Auth-Dto";
import { ValidateSignature } from "../utils";

declare global{
    namespace Express{
        interface Request{
            user?:AuthPayload
        }
    }
}

export const Authenticate = async (req: Request, res: Response, next: NextFunction) => {

    const validate = await ValidateSignature(req)

    if (validate) {
       next()
    }
    else {
        res.status(401).json({message:"UnAuthorized"})
    }
    
}