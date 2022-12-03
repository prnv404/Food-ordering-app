import { Request, Response, NextFunction } from "express";
import { EditVandorInput, VandorLoginInput } from "../dto";
import { CreateFoodInput } from "../dto/Food.dto";
import { Food } from "../model";
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

            // console.log(createFood)

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
