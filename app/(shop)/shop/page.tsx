import ProductSlider from "@/components/layout/shop/product-slider"
import { ProductCard } from "@/components/layout/shop/shop-card"
import { ShopCarousel } from "@/components/layout/shop/shop-carousel"
import BrowsingHistoryList from "@/components/shared/browsing-history-list"
import { Card, CardContent } from "@/components/ui/card"
import { getProductByTag } from "@/lib/actions/product.actions"
import data from "@/lib/data"


const bestSelling = await getProductByTag({tag: 'best-seller'})

const todayDeals = await getProductByTag({tag: 'today-deal'})
export default async function Page() {
    return (<div className="flex flex-col gap-10">
                <ShopCarousel items={data.carousels} />
                <div className="md:p-4 md:space-y-4">
                    <Card className="border-none shadow-none">
                        <CardContent>
                            <ProductSlider 
                                title="Latest Products" 
                                subTitle="See what's new in our collection and browse the latest styles and designs." 
                                products={todayDeals} 
                                showBottom
                                />
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-none">
                        <CardContent>
                            <ProductSlider 
                                title="Best Sellers" 
                                subTitle="Shop our best selling products and find the perfect fit for your style." 
                                products={bestSelling} 
                                showBottom
                                />
                        </CardContent>
                    </Card>
                </div>
                <div className="p-4">
                    <BrowsingHistoryList />
                </div>
            </div>
    )
}