'use client';

import { useEffect, useRef } from 'react';

/**
 * Wraps children in a div that fades/slides in when it enters the viewport.
 * Uses IntersectionObserver — no external libs.
 *
 * Props:
 *   variant  — "fade" | "up" (default) | "slide-right" | "slide-left" | "scale"
 *   delay    — ms to wait before revealing (staggers children)
 *   as       — tag to render (default: div)
 *   once     — reveal only first time (default true)
 */
export default function ScrollReveal({
  children,
  variant = 'up',
  delay = 0,
  as: Tag = 'div',
  once = true,
  className = '',
  style = {},
  ...rest
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reduced motion preference: reveal immediately, no animation.
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('is-visible');
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // apply delay via inline style for staggering
            if (delay > 0) el.style.transitionDelay = `${delay}ms`;
            el.classList.add('is-visible');
            if (once) io.unobserve(el);
          } else if (!once) {
            el.classList.remove('is-visible');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [delay, once]);

  // default "up" uses the base selector with no value; other variants are explicit.
  const revealAttr = variant === 'up' ? '' : variant;

  return (
    <Tag
      ref={ref}
      className={className}
      style={style}
      data-reveal={revealAttr}
      {...rest}
    >
      {children}
    </Tag>
  );
}
