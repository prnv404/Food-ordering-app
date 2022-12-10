import mongoose, { Schema, Document, Model } from "mongoose";

export interface OfferDoc extends Document {

    offerType: string
    Vendor: [any]
    title: string
    description: string
    minValue: string
    offerAmount: string
    startValidity: string
    endValidity: string
    promocode: string
    promoType: string
    bank: [any]
    bins: [any]
    pincode: string
    isActive:boolean
    
}

const OfferSchema = new Schema({
    
    offerType: {type:String,require:true},
    Vendor: [{
        type: mongoose.Types.ObjectId,
        ref:"Vendor"
    }],
    title: {type:String,require:true},
    description: String,
    minValue: {type:Number,require:true},
    offerAmount: {type:Number,require:true},
    startValidity: Date,
    endValidity: Date,
    promocode: {type:String,require:true},
    promoType: {type:String,require:true},
    bank: [{
        type:String
    }],
    bins: [{
        type:String
    }],
    pincode: {type:String,require:true},
    isActive:{type:Boolean,require:true},
    
   
    
}, {
    toJSON: {
        transform(doc, ret) {
            delete ret.__v
            delete ret.createdAt
            delete ret.updatedAt
        }
    },
    timestamps:true
})

const Offer = mongoose.model<OfferDoc>("Offer", OfferSchema)

export { Offer}