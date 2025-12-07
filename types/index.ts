import { z } from "zod"
import { ProductInputSchema } from "@/lib/validator"

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