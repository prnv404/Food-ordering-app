import mongoose, { Schema, Document, Model } from "mongoose";

export interface OrderDoc extends Document {
    OrderId: string  // 2323242

    items: [any],  // [{food,unit:2}]

    totalAmount: number, //500

    paidAmount:number

    orderDate: Date, 

    OrderStaus: string,
    
    vendorId: string
    
    remarks: string,
    
    deliveryId: string,
    
    readyTime: number,
    
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

        paidAmount: { type: Number, required: true }, //500

        orderDate: { type: Date, required: true }, 
    
        OrderStaus: { type: String, },  
        
        vendorId: { type: String, require: true },
        
        remarks: { type: String,  }, 
    
        deliveryId: { type: String,  }, 
        
        readyTime:{ type: Number,  }, 
        
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
