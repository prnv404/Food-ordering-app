import { Request, Response, NextFunction } from "express";
import { CreateOfferInputs, EditVendorInput, VendorLoginInput } from "../dto";
import { CreateFoodInput } from "../dto/Food.dto";
import { Food, Vendor } from "../model";
import { Offer } from "../model/offer";
import { Order } from "../model/order";
import { GenerateSignature, ValidatePassword } from "../utility";
import { findVendor } from "./Admin-Controller";



export const VendorLogin = async (req: Request, res: Response, next: NextFunction) => {

    const { password, email } = <VendorLoginInput>req.body;

    const existingVandor = await findVendor("", email);

    if (!existingVandor) return res.status(401).json({ message: "No Vendor found" });

    const validation = await ValidatePassword(
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


export const GetVendorProfile = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    if (user) {
        const existingVendor = await findVendor(user._id);
        res.json(existingVendor);
    } else {
        res.json({
            message: "No Vandor found",
        });
    }
};

export const UpdateVendorProfile = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    const { name, phone, address, foodType } = <EditVendorInput>req.body;

    if (user) {
        const existingVendor = await findVendor(user._id);

        if (existingVendor !== null) {

            existingVendor.name = name;
            existingVendor.phone = phone;
            existingVendor.address = address;
            existingVendor.foodType = foodType;

            await existingVendor.save();
        }

        res.json(existingVendor);
    } else {
        res.json({
            message: "No Vendor found",
        });
    }
};


export const UpdateCoverImage  = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    if (user) {

        
        const vendor = await findVendor(user._id)

        if (vendor !==null) {
            
            const files = req.files as [Express.Multer.File]

            const images = files.map((file: Express.Multer.File) => file.filename)
            
            vendor.coverImage.push(...images)
            
            const result = await vendor.save()
            
            res.status(201).json(result)
        }

    } else {
        res.json({
            message: "No Vendor found",
        });
    }
};


export const UpdateVendorService = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    const { lag, lat } = req.body
    
    if (user) {
        const existingVendor = await findVendor(user._id);

        if (existingVendor !== null) {

            if (lag && lat) {
                existingVendor.lag = lag
                existingVendor.lat = lat
            }
           
            existingVendor.serviceAvailable = !existingVendor.serviceAvailable
            await existingVendor.save();

        }

        res.json(existingVendor);

    } else {
        res.json({
            message: "No Vendor found",
        });
    }
};



export const AddFood = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    if (user) {

        const { name, description, category, foodType, readyTime, price } = <CreateFoodInput>req.body
        
        const vendor = await findVendor(user._id)

        if (vendor !==null) {
            
            const files = req.files as [Express.Multer.File]

            const images = files.map((file: Express.Multer.File) => file.filename)
            
            const createFood = await Food.create({
                vendorId: vendor._id,
                name:name,
                description: description,
                category:category,
                foodType:foodType,
                readyTime:readyTime,
                price:price,
                images: images,
                rating: 0
            })

             vendor.foods.push(createFood)
            
            const result = await vendor.save()
            
            res.status(201).json(result)
        }

    } else {
        res.json({
            message: "No Vendor found",
        });
    }
};


export const GetFoods = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    if (user) {
        
        const Foods = await Food.find({ vendorId: user._id })

        if (Foods !== null) {
            
            return res.json(Foods)
        }

    } else {
        res.json({
            message: "No Vendor found",
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
        
        const vendor = await findVendor(user._id)
            
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

    const user = req.user

    const offerId = req.params.id

    if (user) {
        
        const { title, description, offerAmount, offerType, pincode, promoType, promocode,
            startValidity, endValidity, bank, bins, isActive, minValue } = <CreateOfferInputs>req.body
        
        const vendor = await findVendor(user._id)
            
        if (vendor !== null) {
          
            const offer = await Offer.findById(offerId)
           
            offer.title = title
            offer.description = description
            offer.offerAmount =   offerAmount
            offer.offerType= offerType
            offer.pincode =  pincode
            offer.promoType = promoType
            offer.promocode = promocode
            offer.startValidity = startValidity
            offer.endValidity= endValidity
            offer.bank = bank
            offer.bins = bins
            offer.isActive = isActive
            offer.minValue = minValue
          
            const result = await offer.save()

            return res.status(200).json(result)
        }
    }
}