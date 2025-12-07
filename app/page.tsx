"use client"
import FullscreenImageOnScroll from "@/components/layout/home/animatedImg"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import AnimatedButton from "@/components/ui/animatedButton"
import WhyUs from "@/components/layout/home/whyUs"
import FeaturedProducts from "@/components/layout/home/browseByCategory"

type Props = {}

const Home = (props: Props) => {
  return (
    <main className="min-h-screen pb-30">
      <section 
      className="relative h-screen w-full text-primary pt-5 md:pt-5 mb-50 md:mb-20"
      >
          <div className="w-full flex flex-col-reverse md:flex-row justify-center items-center h-full gap-4 md:gap-8 px-4">
          <div className="left-section md:w-1/2 w-full md:flex flex-col md:justify-center md:items-end">
            <h3 className="reveal-text text-xs md:text-md lg:text-lg font-inter font-light mb-4 text-center w-full">Welcome to our store where we,</h3>
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-tangerine mb-6 text-center">
              <span className="reveal block">
                <span className="reveal-text pb-6 delay-animation-2">
                  Carry Beauty
                  </span>
              </span>{' '}
              <span className="reveal block">
                <span className="reveal-text pb-6 delay-animation-2">
                  in Every Fold
                </span>
              </span>{' '}
            </h1>
              <AnimatedButton className="transition-all ease-in-out duration-500 mt-6 md:mt-10 py-3 px-5 md:px-8 text-lg md:text-2xl bg-transparent border-earthy-brown hover:bg-earthy-brown hover:text-white hover:scale-105">
                Shop Now
              </AnimatedButton>
            </div>
  
          {/* Image column: responsive sizing via width/height + sizes + utility classes */}
          <div className="right-section md:w-1/2 w-full flex justify-center md:justify-start md:items-center transition-all duration-500 ease-in-out fade-in-100">
            <div className="relative overflow-hidden rounded-lg w-full max-w-lg">
              {/* top-left corner (horizontal + vertical) */}
              <span className="absolute top-4 left-10 z-20 block h-2 w-12 md:w-20 bg-primary" aria-hidden="true" />
              <span className="absolute top-4 left-10 z-20 block w-2 h-12 md:h-20 bg-primary" aria-hidden="true" />

              {/* bottom-right corner (horizontal + vertical) */}
              <span className="absolute bottom-4 right-10 z-20 block h-2 w-12 md:w-20 bg-secondary" aria-hidden="true" />
              <span className="absolute bottom-4 right-10 z-20 block w-2 h-12 md:h-20 bg-secondary" aria-hidden="true" />

              <Image
                src="/heroImg.png"
                alt="Paper Bags"
                width={200}
                height={200}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                className="w-full h-auto object-contain"
                style={{ maxHeight: '90vh' }}
                priority
              />
            </div>
          </div>
         </div>
      </section>

      <FeaturedProducts/>

      <WhyUs/>

      {/* Scoped styles for reveal animation */}
      <style jsx>{`
        .reveal { display:inline-block; overflow:hidden; line-height:1; }
        .reveal.block { display:block; }
        /* slowed animation to 1000ms for a smoother, slower reveal */
        .reveal-text { display:inline-block; transform:translateY(100%); opacity:0; animation:revealUp 1000ms cubic-bezier(.2,.8,.2,1) forwards; }
        /* affordable should appear later than the rest of the heading */
        .reveal-affordable { animation-delay: 0.28s; }
        /* paragraph and button delays */
        .reveal-text.delay-animation-2 { animation-delay: 0.55s; }
        .reveal-text.delay-animation-3 { animation-delay: 0.9s; }
        @keyframes revealUp {
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </main>
  )
}

export default Home