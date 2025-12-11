import { size, z } from "zod";
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

export const OrderItemSchema = z.object({
    clientId: z.string().min(1, "Client ID is required"),
    productIds: z.array(z.string()).min(1, "At least one product ID is required"),
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required"),
    category: z.string().min(1, "Category is required"),
    quantity: z.number().int().nonnegative("Quantity cannot be negative"),
    countInStock: z.number().int().nonnegative("Count in Stock cannot be negative"),
    image: z.string().min(1, "Image URL is required"),
    price: Price("Price").min(0, "Price must be at least 0"),
    totalPrice: Price("Total Price").min(0, "Total Price must be at least 0"),
    size: z.string().optional(),
    color: z.string().optional(),
});

export const CartSchema = z.object({
    clientId: z.string().min(1, "Client ID is required"),
    items: z.array(OrderItemSchema).default([]),
    totalItems: z.coerce.number().int().nonnegative("Total Items cannot be negative").default(0),
    totalPrice: Price("Total Price").min(0, "Total Price must be at least 0").default(0),
    taxPrice: Price("Tax Price").min(0, "Tax Price must be at least 0").default(0),
    shippingPrice: Price("Shipping Price").min(0, "Shipping Price must be at least 0").default(0),
    grandTotalPrice: Price("Grand Total Price").min(0, "Grand Total Price must be at least 0").default(0),
    paymentMethod: z.string().optional(),
    deliveryDateIndex: z.coerce.number().int().nonnegative("Delivery Date Index cannot be negative").optional(),
    expectedDeliveryDate: z.coerce.date().optional(),
});

export const ShippingAddressSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    emirate: z.string().min(1, "Emirate is required"),
    country: z.string().min(1, "Country is required"),
    lat: z.number().optional(),
    lng: z.number().optional(),
});