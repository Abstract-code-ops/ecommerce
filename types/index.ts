import { z } from "zod"
import { ProductInputSchema, CartSchema, OrderItemSchema } from "@/lib/validator"

export type IproductInput = z.infer<typeof ProductInputSchema>;

export type Data = {
    products: IproductInput[];
    headerMenus: {
        name: string,
        href: string
    }[]
    carousels: {
        imageUrl: string,
        title: string,
        buttonCaption: string,
        href: string,
        isPublished: boolean
    }[] 
}

export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Cart = z.infer<typeof CartSchema>;