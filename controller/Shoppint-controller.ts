import { Request, Response, NextFunction } from 'express'
import { FoodDoc, Vandor } from '../model'


export const GetFoodAvailablity = async (req: Request, res: Response, next: NextFunction) => {

    const pincode = req.params.pincode

    const result = await Vandor.find({ pincode: pincode, serviceAvailable: false })
    .sort([['rating', 'descending']])
    .populate('foods')
    
    if (result.length > 0) {
        
        return res.status(200).json(result)
        
    }

    return res.status(400).json({ message: "Data not found" })
    
}

export const GetTopRestaurant = async (req: Request, res: Response, next: NextFunction) => {
    
    const pincode = req.params.pincode

    const result = await Vandor.find({ pincode: pincode, serviceAvailable: false })
    .sort([['rating', 'descending']])
    
    
    if (result.length > 0) {
        
        return res.status(200).json(result)
        
    }

    return res.status(400).json({ message: "Data not found" })
    
}

export const GetFoodsIn30Min = async (req: Request, res: Response, next: NextFunction) => {
    
    const pincode = req.params.pincode

    const result = await Vandor.find({ pincode: pincode, serviceAvailable: false })
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
    
}

export const RestaurantById = async (req: Request, res: Response, next: NextFunction) => {
    
}

