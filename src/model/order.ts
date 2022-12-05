import mongoose, { Schema, Document, Model } from "mongoose";

export interface OrderDoc extends Document {
    OrderId: string  // 2323242

    items: [any],  // [{food,unit:2}]

    totalAmount: number, //500

    orderDate: Date, 

    paidThrough: string, // COD ,CreditCard, Wallet

    paymentResponse: string // {status:true,response:somebankresopnse}

    OrderStaus:string 
}

const OrderSchema = new Schema(
    {
       
        OrderId: { type: String, required: true } , // 2323242

        items: [
            {
                food: { type: Schema.Types.ObjectId, ref: "Food" },
                unit: { type: Number, required: true }
                
            }
        ] ,   // [{food,unit:2}]
    
        totalAmount: { type: Number, required: true }, //500
    
        orderDate: { type: Date, required: true }, 
    
        paidThrough: { type: String,  },  // COD ,CreditCard, Wallet
    
        paymentResponse: { type: String,  },  // {status:true,response:somebankresopnse}
    
        OrderStaus: { type: Date,  },  
        
    },
    {
        toJSON: {
            transform(doc, ret) {
                delete ret.__v;
                delete ret.createdAt;
                delete ret.updatedAt;
            },
        },
        timestamps: true,
    }
);

const Order = mongoose.model<OrderDoc>("Order", OrderSchema);

export { Order };
