"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

export function InteractiveGridBg() {
  const [position, setPosition] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
    };

    window.addEventListener("mousemove", updatePosition);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    document.documentElement.addEventListener("mouseenter", () => setIsHovered(true));

    return () => {
      window.removeEventListener("mousemove", updatePosition);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      document.documentElement.removeEventListener("mouseenter", () => setIsHovered(true));
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-[100vh] items-center justify-center bg-white dark:bg-[#09090B] pointer-events-none z-0">
      
      {/* Base Grid (Black dots in light mode, White dots in dark mode) */}
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:24px_24px]",
          "[background-image:radial-gradient(black_1px,transparent_1px)]",
          "dark:[background-image:radial-gradient(white_1px,transparent_1px)]",
          "opacity-20 dark:opacity-20"
        )}
      />

      {/* Interactive Hover Grid (Larger Purple dots) */}
      <div
        className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
        style={{
          opacity: isHovered ? 1 : 0,
          backgroundSize: "24px 24px",
          backgroundImage: "radial-gradient(#6366F1 2px, transparent 2px)",
          maskImage: `radial-gradient(100px circle at ${position.x}px ${position.y}px, black 0%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(100px circle at ${position.x}px ${position.y}px, black 0%, transparent 100%)`,
        }}
      />

      {/* Radial gradient for the container to give a faded look similar to shadcn's standard effect */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-[#09090B]"></div>
    </div>
  );
}