import { z } from "zod";
import { formatNumberWithDecimal } from "./utils";

const Price = (field: string) =>
    z.coerce
     .number()
     .refine(
        (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(value)),
        `${field} must have at most two decimal places`
     )

export const ProductInputSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    slug: z.string().min(1, "Product slug is required"),
    category: z.string().min(1, "Category is required"),
    images: z.array(z.string()).min(1, "At least one image is required"),
    description: z.string().min(1, "Description is required"),
    price: Price("Price").min(0, "Price must be at least 0"),
    isPublished: z.boolean(),
    listPrice: Price("List Price").min(0, "List Price must be at least 0").optional(),
    countInStock: z.coerce
        .number()
        .int("Count in Stock must be an integer")
        .nonnegative("Count in Stock cannot be negative"),
    tags: z.array(z.string()).default([]),
    sizes: z.array(z.string()).default([]),
    dimensions: z.object({
        width: z.coerce.number().nonnegative("Width cannot be negative"),
        height: z.coerce.number().nonnegative("Height cannot be negative"),
        depth: z.coerce.number().nonnegative("Depth cannot be negative"),
    }),
    colors: z.array(z.string()).default([]),
    avgRating: z.coerce
        .number()
        .min(0, "Average Rating cannot be less than 0")
        .max(5, "Average Rating cannot be more than 5")
        .optional(),
    numReviews: z.coerce.number().int("Number of Reviews must be an integer").nonnegative("Number of Reviews cannot be negative").optional(),
    ratingDistribution: z.array(
        z.object({
            rating: z.coerce.number().int().min(1).max(5),
            count: z.coerce.number().int().nonnegative(),
        })).max(5, "Rating Distribution can have at most 5 entries").optional(),
    reviews: z.array(z.string()).default([]),
    numSales: z.coerce.number().int().nonnegative("Number of Sales cannot be negative").optional(),
})