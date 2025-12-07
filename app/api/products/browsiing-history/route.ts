import { NextRequest, NextResponse } from "next/server";

import Product from "@/lib/db/models/product.model";
import { connectToDB } from "@/lib/db";

export const GET = async (req: NextRequest) => {
    
    const listType = req.nextUrl.searchParams.get('listType') || 'history';
    const productIdsParams = req.nextUrl.searchParams.get('ids');
    const categoriesParams = req.nextUrl.searchParams.get('categories');

    if (!productIdsParams || !categoriesParams) return NextResponse.error();

    const productIds = productIdsParams.split(',');
    const categories = categoriesParams.split(',');

    const filter = 
    listType === 'history' ?
    {
        _id: { $in: productIds },
    } :
    {
        category: { $in: categories },
        _id: { $nin: productIds },
    }

    await connectToDB();
    const products = await Product.find(filter).limit(10);
    
    if (listType === 'history')
        return NextResponse.json(
            products.sort(
                (a, b) =>
                    productIds.indexOf(a._id.toString()) -
                    productIds.indexOf(b._id.toString())
            )
        )
    
    return NextResponse.json(products)
}