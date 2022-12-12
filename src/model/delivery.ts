import mongoose, { Schema, Document, Model } from "mongoose";
import { OrderDoc } from './order'

export interface DeliveryDoc extends Document {
    email: string;
    password: string;
    salt: string;
    firstName: string;
    lastName: string;
    address: string;
    phone: string;
    lat: number;
    lng: number;
    verified: boolean
    isAvailable:boolean
    
}

const DeliverySchema = new Schema(
    {
        email: { type: String, require: true },

        password: { type: String, require: true },

        phone: { type: String, require: true },

        salt: { type: String ,require:true},

        firstName: { type: String },

        lastName: { type: String },

        address: { type: String },

        verified: { type: Boolean ,require:true},

        lat: { type: Number },

        lng: { type: Number },

        isAvaliable: { type: Boolean },
       
    },
    {
        toJSON: {
            transform(doc, ret) {
                delete ret.password;
                delete ret.salt;
                delete ret.__v;
                delete ret.createdAt;
                delete ret.updatedAt;
            },
        },
        timestamps: true,
    }
);

const Delivery = mongoose.model<DeliveryDoc>("Delivery", DeliverySchema);

export { Delivery };
