import { getCouponByCode } from '@/lib/actions/coupon.actions'
import CouponModal from './coupon-modal'
import { redirect } from 'next/navigation'

interface CouponPageProps {
  params: Promise<{ code: string }>
}

export default async function CouponPage({ params }: CouponPageProps) {
  const { code } = await params
  const result = await getCouponByCode(code)
  
  if (!result.success || !result.data) {
    redirect('/shop?error=invalid_coupon')
  }
  
  const coupon = result.data
  
  return (
    <CouponModal 
      coupon={{
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
        description: coupon.description,
        minOrderAmount: coupon.min_order_amount,
        expiresAt: coupon.expires_at,
      }}
      isValid={result.isValid}
      invalidReason={result.invalidReason}
    />
  )
}
