import mongoose, { Schema, Document, Model } from "mongoose";
import { OrderDoc } from './order'

export interface CustomerDoc extends Document {
    email: string;
    password: string;
    salt: string;
    firstName: string;
    lastName: string;
    address: string;
    verifed: boolean;
    phone: string;
    otp: number;
    otp_expiry: Date;
    lat: number;
    lng: number;
    Orders: [OrderDoc]
    cart:[any]
}

const CustomerSchema = new Schema(
    {
        email: { type: String, required: true },

        password: { type: String, required: true },

        phone: { type: String, required: true },

        salt: { type: String ,required:true},

        firstName: { type: String },

        lastName: { type: String },

        address: { type: String },

        verifed: { type: Boolean ,required:true},

        otp: { type: Number,requried:true },

        otp_expiry: { type: Date,required:true },

        lat: { type: Number },

        lng: { type: Number },

        cart:[
            {
                food: {
                    type: Schema.Types.ObjectId,
                    ref: 'Food'
                },
                unit: {
                    type: Number,
                    require:true
                }
            }
        ],
        Orders: [
            {
                type: Schema.Types.ObjectId,
                ref:'Order'
            }
        ]
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

const Customer = mongoose.model<CustomerDoc>("Customer", CustomerSchema);

export { Customer };
