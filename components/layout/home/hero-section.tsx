import Image from 'next/image'
import Link from 'next/link'

interface HeroSectionProps {
  /** Headline text – rendered in serif (Spectral) */
  title: string
  /** Supporting copy – rendered in sans-serif (Inter) */
  subtitle?: string
  /** CTA label (defaults to "Shop Now") */
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
// Component
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
    <section className="relative w-full h-[80vh] overflow-hidden bg-neutral-950">
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
          bg-linear-to-b from-black/70 via-black/40 to-transparent
        "
        aria-hidden="true"
      />

      {/* ----------------------------------------------------------------- */}
      {/* DESKTOP OVERLAY — subtle left-side gradient so text pops           */}
      {/* ----------------------------------------------------------------- */}
      <div
        className="
          absolute inset-0 hidden md:block
          bg-linear-to-r from-black/60 via-black/25 to-transparent
        "
        aria-hidden="true"
      />

      {/* ----------------------------------------------------------------- */}
      {/* TEXT CONTENT                                                        */}
      {/* ----------------------------------------------------------------- */}
      <div className="relative z-10 flex h-full w-full">
        {/* ----- Mobile: top-aligned, centred ----- */}
        <div
          className="
            flex md:hidden flex-col items-center text-center
            w-full px-6 pt-20
          "
        >
          <h1
            className="
              font-serif text-4xl sm:text-5xl leading-[1.1] tracking-tight
              text-black drop-shadow-lg
              max-w-md
            "
          >
            {title}
          </h1>

          {subtitle && (
            <p
              className="
                mt-4 text-base sm:text-lg leading-relaxed
                text-white/85 drop-shadow-sm
                max-w-sm font-light
              "
            >
              {subtitle}
            </p>
          )}

          <Link href={href} className="mt-8">
            <span
              className="
                inline-block rounded-full
                bg-primary text-white
                px-8 py-3 text-sm font-semibold tracking-wide uppercase
                shadow-lg
                transition-transform duration-300 ease-out
                hover:scale-105 active:scale-[0.98]
              "
            >
              {buttonCaption}
            </span>
          </Link>
        </div>

        {/* ----- Desktop: left-aligned in negative space ----- */}
        <div
          className="
            hidden md:flex flex-col justify-center
            h-full max-w-xl lg:max-w-2xl
            pl-10 lg:pl-20 xl:pl-28 pr-8
          "
        >
          <h1
            className="
              font-serif text-5xl lg:text-6xl xl:text-7xl leading-[1.08] tracking-tight
              text-black drop-shadow-lg
            "
          >
            {title}
          </h1>

          {subtitle && (
            <p
              className="
                mt-5 lg:mt-6 text-lg lg:text-xl xl:text-2xl leading-relaxed
                text-white/85 drop-shadow-sm
                max-w-lg font-light
              "
            >
              {subtitle}
            </p>
          )}

          <div className="mt-10 lg:mt-12">
            <Link href={href}>
              <span
                className="
                  inline-block rounded-full
                  bg-primary text-white
                  px-10 py-4 text-base font-semibold tracking-wide uppercase
                  shadow-xl
                  transition-transform duration-300 ease-out
                  hover:scale-105 active:scale-[0.98]
                "
              >
                {buttonCaption}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
