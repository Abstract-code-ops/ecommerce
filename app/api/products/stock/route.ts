import { NextRequest, NextResponse } from 'next/server'
import { connectToDB } from '@/lib/db'
import Product from '@/lib/db/models/product.model'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('id')

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    await connectToDB()

    const product = await Product.findById(productId).select('countInStock').lean()

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      stock: (product as { countInStock?: number }).countInStock ?? 0,
    })
  } catch (error) {
    console.error('Error fetching product stock:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock' },
      { status: 500 }
    )
  }
}
