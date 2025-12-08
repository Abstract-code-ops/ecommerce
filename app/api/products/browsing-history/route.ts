import { NextRequest, NextResponse } from "next/server";

import Product from "@/lib/db/models/product.model";
import { connectToDB } from "@/lib/db";

export const GET = async (req: NextRequest) => {
    
    const typeParam = req.nextUrl.searchParams.get("type") ?? req.nextUrl.searchParams.get("listType");
    const listType = typeParam || "history";
    const productIdsParams = req.nextUrl.searchParams.get('ids');
    const categoriesParams = req.nextUrl.searchParams.get('categories');

    if (!productIdsParams || !categoriesParams) return NextResponse.json({ error: "Missing `ids` or `categories` query parameters" }, { status: 400 });

    const productIds = productIdsParams.split(',').filter(Boolean);
    const categories = categoriesParams.split(',').filter(Boolean);

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