"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue, useReducedMotion } from "framer-motion";

export default function CustomCursor() {
  const prefersReducedMotion = useReducedMotion();
  const [isHovering, setIsHovering] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isKeyboardNav, setIsKeyboardNav] = useState(false);
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Check if it's a touch device
    if (window.matchMedia("(pointer: coarse)").matches) {
      setIsTouchDevice(true);
      return;
    }

    const moveCursor = (e: MouseEvent) => {
      // Pointer intent resumes — hand control back to the dot
      setIsKeyboardNav((prev) => (prev ? false : prev));
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Tab signals keyboard navigation — step the dot aside so focus rings lead
      if (e.key === "Tab") {
        setIsKeyboardNav((prev) => (prev ? prev : true));
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if we are hovering over an interactive element
      if (
        target.closest("a") || 
        target.closest("button") || 
        target.closest(".glass-card") ||
        target.closest("input")
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [cursorX, cursorY]);

  // Respect reduced motion the same way isTouchDevice is handled: restore the
  // native cursor entirely rather than showing a toned-down animated one --
  // the whole point is a persistent spring-animated element, so "less motion"
  // for this component means "no custom cursor".
  if (isTouchDevice || prefersReducedMotion) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 rounded-full pointer-events-none z-[100] bg-white mix-blend-difference"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        translateX: "-50%",
        translateY: "-50%",
      }}
      initial={{
        width: 12,
        height: 12,
        opacity: 1,
      }}
      animate={{
        width: isHovering ? 40 : 12,
        height: isHovering ? 40 : 12,
        opacity: isKeyboardNav ? 0 : 1,
        scale: isKeyboardNav ? 0.4 : 1,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    />
  );
}
