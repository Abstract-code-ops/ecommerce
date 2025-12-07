import { Document, Model, model, models, Schema } from "mongoose";
import { IproductInput } from "@/types";

// Define the Product interface extending mongoose Document
export interface IProduct extends IproductInput, Document {}

// Define the Product schema extending mongoose Schema
const productSchema = new Schema<IProduct>({
    name: { type: String, required: true },
    slug: { 
        type: String,
        required: true,
        unique: true
    },
    category: { type: String, required: true},
    images: { type: [String], required: true},
    description: {type: String, trim: true},
    price: { type: Number, required: true},
    listPrice: { type:Number},
    countInStock: { type: Number, required: true},
    isPublished: { type: Boolean, required: true},
    tags: { type: [String], default: []},
    sizes: { type: [String], default: []},
    colors: { type: [String], default: []},
    dimensions: {
        width: { type: Number, required: true },
        height: { type: Number, required: true },
        depth: { type: Number, required: true }
    },
    avgRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    ratingDistribution: [
        {
            rating: { type: Number, required: true }, count: { type: Number, required: true }
        },
    ],
    reviews: [
        {
            type: Schema.Types.ObjectId, ref: "Review", default: []
        }
    ],
    numSales: { type: Number, default: 0 },
}, {
    timestamps: true
})

const Product: Model<IProduct> = models.Product || model<IProduct>("Product", productSchema);

export default Product