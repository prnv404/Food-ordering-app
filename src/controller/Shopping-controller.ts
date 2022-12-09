import { Request, Response, NextFunction } from 'express'
import { FoodDoc, Vendor } from '../model'
import { Offer } from '../model/offer'


export const GetFoodAvailablity = async (req: Request, res: Response, next: NextFunction) => {

    const pincode = req.params.pincode

    const result = await Vendor.find({ pincode: pincode, serviceAvailable: false })
    .sort([['rating', 'descending']])
    .populate('foods')
    
    if (result.length > 0) {
        
        return res.status(200).json(result)
        
    }

    return res.status(400).json({ message: "Data not found" })
    
}

export const GetTopRestaurant = async (req: Request, res: Response, next: NextFunction) => {
    
    const pincode = req.params.pincode

    const result = await Vendor.find({ pincode: pincode, serviceAvailable: false })
    .sort([['rating', 'descending']])
    
    
    if (result.length > 0) {
        
        return res.status(200).json(result)
        
    }

    return res.status(400).json({ message: "Data not found" })
    
}

export const GetFoodsIn30Min = async (req: Request, res: Response, next: NextFunction) => {
    
    const pincode = req.params.pincode

    const result = await Vendor.find({ pincode: pincode, serviceAvailable: false })
    .populate('foods')
    
    
    if (result.length > 0) {

        let FoodsItem : any[] = []
        
        result.map((item) => {
            
            const foods = item.foods as [FoodDoc]

            FoodsItem.push(...foods.filter((food) => food.readyTime <= 30))
            
        })

        return res.status(200).json(FoodsItem)
        
    }

    return res.status(400).json({ message: "Data not found" })

}

export const SearchFood = async (req: Request, res: Response, next: NextFunction) => {
    
    const pincode = req.params.pincode

    const result = await Vendor.find({ pincode: pincode, serviceAvailable: false })
    .populate('foods')
    
    if (result.length > 0) {

        let FoodsItem: any[] = []

        result.map(item=> FoodsItem.push(...item.foods))
        
        return res.status(200).json(FoodsItem)
        
    }

    return res.status(400).json({ message: "Data not found" })
}

export const RestaurantById = async (req: Request, res: Response, next: NextFunction) => {
    
    const id = req.params.id

    const result = await Vendor.findById(id).populate('foods')
    
    if (result) {
        
        return res.status(200).json(result)
        
    }

    return res.status(400).json({ message: "Data not found" })
}

export const GetAvailableOffers = async (req: Request, res: Response, next: NextFunction) => {

    const pincode = req.params.pincode

    if (pincode) {
        
        const offers = await Offer.find({ pincode: pincode, isActive: true })

        if (offers) {
            
            return res.status(200).json(offers)
        }

    }

    return res.status(400).json({ message: "Data not found" })

}