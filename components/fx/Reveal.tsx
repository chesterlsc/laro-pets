'use client';
import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Fade-up on scroll. SSR HTML is fully visible; the hide+animate only kicks in after mount (class `js-reveal`) and only
 * for elements still below the fold — elements already in view get data-reveal="in" with no animation.
 */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight * 0.92 && r.bottom > 0) {
      el.dataset.reveal = 'in';
      return;
    }
    el.classList.add('js-reveal');
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.dataset.reveal = 'in';
        io.disconnect();
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} data-reveal="pending" className={className} style={delay ? { animationDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}
