import React, { useEffect, useRef, useState } from "react";

interface FadeInProps {
  children: React.ReactNode;
  direction?: "up" | "down" | "fade" | "scale";
  delay?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function FadeIn({
  children,
  direction = "up",
  delay = 0,
  className = "",
  as = "div",
}: FadeInProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  // Dynamic tag: widen the type once instead of suppressing errors.
  const Tag = as as React.ElementType;

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const getAnimationClass = () => {
    if (!isVisible) return "opacity-0";
    switch (direction) {
      case "up":
        return "animate-fade-up";
      case "down":
        return "animate-fade-down";
      case "scale":
        return "animate-scale-in";
      case "fade":
      default:
        return "animate-fade-in";
    }
  };

  const delayStyle = delay > 0 ? { animationDelay: `${delay}ms` } : undefined;

  return (
    <Tag ref={ref} style={delayStyle} className={`${getAnimationClass()} ${className}`}>
      {children}
    </Tag>
  );
}
