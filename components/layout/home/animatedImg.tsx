import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function HeroScrollAnimation() {
  const containerRef = useRef(null);

  // Track scroll progress for this element only
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Image starts huge → scales to 1
  const scale = useTransform(scrollYProgress, [0, 1], [2, 1]);

  // Move the image downward into its natural position
  const translateY = useTransform(scrollYProgress, [0, 1], [-200, 0]);

  return (
    <div
      ref={containerRef}
      className="h-screen w-full bg-neutral-900"
    >
      <motion.img
        src="/bannerImg.png"
        style={{ scale, y: translateY }}
        className="sticky top-0 w-full h-screen object-cover"
      />
    </div>
  );
}
