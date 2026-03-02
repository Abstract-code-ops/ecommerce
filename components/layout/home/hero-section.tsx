import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface HeroSectionProps {
  /** Headline text – rendered in bold sans-serif */
  title: string
  /** Supporting copy */
  subtitle?: string
  /** Primary CTA label (defaults to "Shop Now") */
  buttonCaption?: string
  /** CTA destination */
  href?: string
  /** Cloudinary URL for the desktop hero (16:9) */
  desktopImageUrl: string
  /** Cloudinary URL for the mobile hero (4:5) */
  mobileImageUrl: string
}

// ---------------------------------------------------------------------------
// Cloudinary URL helper – injects optimisation transforms  after `/upload/`
// while preserving any existing transforms or version segments.
// ---------------------------------------------------------------------------
function withCloudinaryTransforms(url: string): string {
  if (!url || !url.includes('res.cloudinary.com')) return url

  const transforms = 'f_auto,q_auto,c_fill,g_auto'
  // Match /upload/ and optionally any existing transform chain
  // e.g. /upload/v1234/… or /upload/w_800,h_600/v1234/…
  const uploadSegment = '/upload/'
  const idx = url.indexOf(uploadSegment)
  if (idx === -1) return url

  const before = url.slice(0, idx + uploadSegment.length)
  const after = url.slice(idx + uploadSegment.length)

  // If the transforms are already present, skip
  if (after.startsWith(transforms)) return url

  return `${before}${transforms}/${after}`
}

// ---------------------------------------------------------------------------
// Component - Premium Minimalist Hero Section
// ---------------------------------------------------------------------------
export default function HeroSection({
  title,
  subtitle,
  buttonCaption = 'Shop Now',
  href = '/shop/products',
  desktopImageUrl,
  mobileImageUrl,
}: HeroSectionProps) {
  const desktopSrc = withCloudinaryTransforms(desktopImageUrl)
  const mobileSrc = withCloudinaryTransforms(mobileImageUrl)

  return (
    <section className="relative w-full min-h-[85vh] overflow-hidden bg-[#F9FAF7]">
      {/* ----------------------------------------------------------------- */}
      {/* ART DIRECTION — two <Image /> elements, toggled via Tailwind       */}
      {/* ----------------------------------------------------------------- */}

      {/* Mobile image (4:5) — visible below md */}
      <div className="absolute inset-0 block md:hidden">
        <Image
          src={mobileSrc}
          alt={title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>

      {/* Desktop image (16:9) — visible md and up */}
      <div className="absolute inset-0 hidden md:block">
        <Image
          src={desktopSrc}
          alt={title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* MOBILE OVERLAY — gradient from top for readability                  */}
      {/* ----------------------------------------------------------------- */}
      <div
        className="
          absolute inset-0 md:hidden
          bg-gradient-to-b from-[#1B3022]/80 via-[#1B3022]/40 to-transparent
        "
        aria-hidden="true"
      />

      {/* ----------------------------------------------------------------- */}
      {/* DESKTOP OVERLAY — subtle left-side gradient so text pops           */}
      {/* ----------------------------------------------------------------- */}
      <div
        className="
          absolute inset-0 hidden md:block
          bg-gradient-to-r from-[#1B3022]/70 via-[#1B3022]/30 to-transparent
        "
        aria-hidden="true"
      />

      {/* ----------------------------------------------------------------- */}
      {/* TEXT CONTENT                                                        */}
      {/* ----------------------------------------------------------------- */}
      <div className="relative z-10 flex h-full w-full min-h-[85vh]">
        {/* ----- Mobile: top-aligned, centred ----- */}
        <div
          className="
            flex md:hidden flex-col items-center text-center
            w-full px-6 pt-24
          "
        >
          <h1
            className="
              font-bold text-4xl sm:text-5xl leading-[1.1] tracking-[-0.02em]
              text-white drop-shadow-lg
              max-w-md
            "
          >
            {title}
          </h1>

          {subtitle && (
            <p
              className="
                mt-5 text-base sm:text-lg leading-relaxed font-normal
                text-white/90 drop-shadow-sm
                max-w-sm
              "
            >
              {subtitle}
            </p>
          )}

          {/* Buttons - Pill shaped, Sage Green */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Link href={href}>
              <span
                className="
                  inline-flex items-center justify-center gap-2 rounded-full
                  bg-[#9DBE91] hover:bg-[#8AAE7E] text-white
                  px-8 py-3.5 text-sm font-semibold tracking-wide uppercase
                  shadow-lg
                  transition-all duration-300 ease-out
                  hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0
                "
              >
                {buttonCaption}
                <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
            <Link href="/shop/products">
              <span
                className="
                  inline-flex items-center justify-center gap-2 rounded-full
                  bg-white border-2 border-[#9DBE91] text-[#1B3022]
                  px-8 py-3.5 text-sm font-semibold tracking-wide uppercase
                  shadow-lg
                  transition-all duration-300 ease-out
                  hover:bg-[#9DBE91] hover:text-white hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0
                "
              >
                View Collection
                <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>

        {/* ----- Desktop: left-aligned in negative space ----- */}
        <div
          className="
            hidden md:flex flex-col justify-center
            h-full max-w-2xl lg:max-w-3xl
            pl-10 lg:pl-20 xl:pl-28 pr-8 py-6
          "
        >
          <h1
            className="
              font-bold text-4xl lg:text-5xl xl:text-[4rem] leading-[1.1] tracking-[-0.02em]
              text-white drop-shadow-lg
            "
          >
            {title}
          </h1>

          {subtitle && (
            <p
              className="
                mt-6 lg:mt-8 text-lg lg:text-xl xl:text-2xl leading-relaxed font-normal
                text-white/90 drop-shadow-sm
                max-w-xl
              "
            >
              {subtitle}
            </p>
          )}

          {/* Buttons - Pill shaped, Sage Green */}
          <div className="flex gap-4 mt-10 lg:mt-12">
            <Link href={href}>
              <span
                className="
                  inline-flex items-center justify-center gap-2 rounded-full
                  bg-[#9DBE91] hover:bg-[#8AAE7E] text-white
                  px-10 py-4 text-base font-semibold tracking-wide uppercase
                  shadow-xl
                  transition-all duration-300 ease-out
                  hover:shadow-2xl hover:-translate-y-1 active:translate-y-0
                "
              >
                {buttonCaption}
                <ChevronRight className="w-5 h-5" />
              </span>
            </Link>
            <Link href="/shop/products">
              <span
                className="
                  inline-flex items-center justify-center gap-2 rounded-full
                  bg-transparent border-2 border-[#9DBE91] text-white
                  px-10 py-4 text-base font-semibold tracking-wide uppercase
                  shadow-xl
                  transition-all duration-300 ease-out
                  hover:bg-[#9DBE91] hover:text-white hover:shadow-2xl hover:-translate-y-1 active:translate-y-0
                "
              >
                View Collection
                <ChevronRight className="w-5 h-5" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
