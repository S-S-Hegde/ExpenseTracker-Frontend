import { useEffect, useRef } from "react";
import Lenis from "lenis";

export function useLenis() {
  const lenisRef = useRef(null);

  useEffect(() => {
    let lenis;
    let animId;

    try {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.5,
        infinite: false,
      });

      lenisRef.current = lenis;

      function raf(time) {
        lenis.raf(time);
        animId = requestAnimationFrame(raf);
      }

      animId = requestAnimationFrame(raf);
    } catch (e) {
      console.warn("Lenis initialization error:", e);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (lenis) lenis.destroy();
    };
  }, []);

  return lenisRef;
}

export default useLenis;
