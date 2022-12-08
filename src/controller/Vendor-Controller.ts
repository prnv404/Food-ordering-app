import { Request, Response, NextFunction } from "express";
import { CreateOfferInputs, EditVandorInput, VandorLoginInput } from "../dto";
import { CreateFoodInput } from "../dto/Food.dto";
import { Food, Vandor } from "../model";
import { Offer } from "../model/offer";
import { Order } from "../model/order";
import { GenerateSignature, validatePassword } from "../utils";
import { findVandor } from "./Admin-Controller";



export const VandorLogin = async (req: Request, res: Response, next: NextFunction) => {

    const { password, email } = <VandorLoginInput>req.body;

    const existingVandor = await findVandor("", email);

    if (!existingVandor) return res.status(401).json({ message: "No Vandor found" });

    const validation = await validatePassword(
        password,
        existingVandor.password,
        existingVandor.salt
    );

    if (validation) {
        const signature = GenerateSignature({
            _id: existingVandor._id,
            name: existingVandor.name,
            email: existingVandor.email,
            foodType: existingVandor.foodType,
        });

        // console.log(signature)
        return res.status(200).json(signature);

    } else {
        return res.status(400).json({ message: "Password incorrect" });
    }
};


export const GetVandorProfile = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    if (user) {
        const existingVandor = await findVandor(user._id);
        res.json(existingVandor);
    } else {
        res.json({
            message: "No Vandor found",
        });
    }
};

export const UpdateVandorProfile = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    const { name, phone, address, foodType } = <EditVandorInput>req.body;

    if (user) {
        const existingVandor = await findVandor(user._id);

        if (existingVandor !== null) {

            existingVandor.name = name;
            existingVandor.phone = phone;
            existingVandor.address = address;
            existingVandor.foodType = foodType;

            await existingVandor.save();
        }

        res.json(existingVandor);
    } else {
        res.json({
            message: "No Vandor found",
        });
    }
};


export const UpdateCoverImage  = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    if (user) {

        
        const vandor = await findVandor(user._id)

        if (vandor !==null) {
            
            const files = req.files as [Express.Multer.File]

            const images = files.map((file: Express.Multer.File) => file.filename)
            
            vandor.coverImage.push(...images)
            
            const result = await vandor.save()
            
            res.status(201).json(result)
        }

    } else {
        res.json({
            message: "No Vandor found",
        });
    }
};


export const UpdateVandorService = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    if (user) {
        const existingVandor = await findVandor(user._id);

        if (existingVandor !== null) {
           
            existingVandor.serviceAvailable = !existingVandor.serviceAvailable
            await existingVandor.save();

        }

        res.json(existingVandor);

    } else {
        res.json({
            message: "No Vandor found",
        });
    }
};



export const AddFood = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    if (user) {

        const { name, description, category, foodType, readyTime, price } = <CreateFoodInput>req.body
        
        const vandor = await findVandor(user._id)

        if (vandor !==null) {
            
            const files = req.files as [Express.Multer.File]

            const images = files.map((file: Express.Multer.File) => file.filename)
            
            const createFood = await Food.create({
                vandorId: vandor._id,
                name:name,
                description: description,
                category:category,
                foodType:foodType,
                readyTime:readyTime,
                price:price,
                images: images,
                rating: 0
            })

             vandor.foods.push(createFood)
            
            const result = await vandor.save()
            
            res.status(201).json(result)
        }

    } else {
        res.json({
            message: "No Vandor found",
        });
    }
};


export const GetFoods = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    if (user) {
        
        const Foods = await Food.find({ vandorId: user._id })

        if (Foods !== null) {
            
            return res.json(Foods)
        }

    } else {
        res.json({
            message: "No Vandor found",
        });
    }
};



export const GetCurrentOrders = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user
    
    if (user) {
        
        const orders = await Order.find({ vendorId: user._id }).populate('items.food')

        if (orders !== null) {
            return res.status(200).json(orders)
        }
        
    }
    return res.status(400).json({ message: "Error with fetching orders" })
    
}

export const GetOrderDetails = async (req: Request, res: Response, next: NextFunction) => {

    const id = req.params.id
    
        const order = await Order.findById(id).populate('items.food')

        if (order !== null) {
            return res.status(200).json(order)
        }
        
    
    return res.status(400).json({ message: "Error with fetching orders" })
    
}


export const ProcessOrder = async (req: Request, res: Response, next: NextFunction) => {

    const orderId = req.params.id

    const { status, remarks, time } = req.body
    
    if (orderId) {
        
        const order = await Order.findById(orderId).populate('items')

        if (order !== null) {
            
            order.OrderStaus = status
            order.remarks = remarks
            if (time) {
                order.readyTime = time
            }

            const orderResult = await order.save()

            if (orderResult !== null) {
                
                return res.status(201).json(orderResult)
            }
        }

    }
    return res.status(400).json({ message: "Error with Processing orders" })

}

export const GetOffer = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user

    if (user) {
        
        const offers = await Offer.find().populate('Vendor')

        if (offers) {
            
            let currentOffers = Array()

            offers.map(item => {

                if (item.Vendor) {

                    item.Vendor.map(vendor => {

                        if (vendor._id.toString() == user._id) {

                            currentOffers.push(item)

                        }
                    })
                }

                if (item.offerType === 'GENERIC') {
                    currentOffers.push(item)
                }

            })
            return res.status(200).json(currentOffers)
        }
       
    }

    return res.status(400).json({ message: "Error with Getting Offer" })

}

export const AddOffer = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user

    if (user) {
        
        const { title, description, offerAmount, offerType, pincode, promoType, promocode,
            startValidity, endValidity, bank, bins, isActive, minValue } = <CreateOfferInputs>req.body
        
        const vendor = await findVandor(user._id)
            
        if (vendor !== null) {
          
            const offer = await Offer.create({
                title,
                description,
                offerAmount,
                offerType,
                pincode,
                promoType,
                promocode,
                startValidity,
                endValidity,
                bank,
                bins,
                isActive,
                minValue,
                Vendor:[vendor]
            })

            return res.status(200).json(offer)

        }
    }
    return res.status(400).json({ message: "Error with Creating Offer" })
    
        
}

export const EditOffer = async (req: Request, res: Response, next: NextFunction) => {
}