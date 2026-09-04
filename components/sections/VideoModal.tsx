'use client';
import Image from 'next/image';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ButtonHTMLAttributes, type ComponentProps, type ReactNode } from 'react';
import { Icon } from '@/components/icons';
import { Button } from '@/components/ui';
import { images, type ImageKey } from '@/content/images';
import { product } from '@/content/product';
import { track } from '@/lib/analytics';

const Ctx = createContext<{ open: () => void }>({ open: () => {} });
export const useVideoModal = () => useContext(Ctx);

/** Wrap the page once; every <OpenDemo>/<DemoButton>/<DemoCard> below opens the same modal. */
export function VideoModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const open = useCallback(() => {
    opener.current = document.activeElement as HTMLElement | null;
    track('play_demo');
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.querySelector('button')?.focus();
    video.current?.play().catch(() => {}); // user already clicked; browsers may still block — controls remain
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return close();
      if (e.key !== 'Tab' || !dialog.current) return;
      const f = dialog.current.querySelectorAll<HTMLElement>('button, video');
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      opener.current?.focus();
    };
  }, [isOpen, close]);

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      {isOpen && (
        <div ref={dialog} role="dialog" aria-modal="true" aria-label={`${product.name} demo video`} onClick={(e) => e.target === e.currentTarget && close()} className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 p-4">
          <button type="button" onClick={close} aria-label="Close video" className="absolute top-3 right-3 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-white hover:bg-white/10">
            <Icon name="close" size={26} />
          </button>
          <video ref={video} controls playsInline preload="none" poster={images.videoPounce.src} width={product.demoVideo.width} height={product.demoVideo.height} className="block h-auto rounded-card bg-black" style={{ width: 'min(92vw, calc(min(90vh, 1440px) * 0.75))', maxHeight: 'min(90vh, 1440px)', aspectRatio: '3 / 4' }}>
            <source src={product.demoVideo.src} type="video/mp4" />
            <source src={product.demoVideo.fallbackSrc} type="video/mp4" />
          </video>
        </div>
      )}
    </Ctx.Provider>
  );
}

/** Any element that opens the demo modal (server components can use this). */
export function OpenDemo(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open } = useVideoModal();
  return <button type="button" {...props} onClick={open} />;
}

/** A styled <Button> that opens the demo modal. */
export function DemoButton(props: ComponentProps<typeof Button>) {
  const { open } = useVideoModal();
  return <Button {...props} onClick={open} />;
}

/** Poster card with label pill, time chip, play circle and gradient caption; the whole card opens the modal. */
export function DemoCard({ image, label, time, caption, captionClass, className, sizes, priority, 'aria-label': ariaLabel }: {
  image: ImageKey; label: string; time: string; caption: ReactNode; captionClass: string; className: string; sizes: string; priority?: boolean; 'aria-label': string;
}) {
  return (
    <OpenDemo className={`relative block cursor-pointer overflow-hidden rounded-card bg-[#222] text-left ${className}`}>
      <span className="sr-only">{ariaLabel}. </span>
      <Image src={images[image].src} alt={images[image].alt} fill sizes={sizes} priority={priority} className="object-cover" />
      <span className="absolute top-[14px] left-[14px] rounded-full bg-white/92 px-[10px] py-[6px] text-[12px] font-extrabold uppercase tracking-[0.06em] text-ink">{label}</span>
      <span className="absolute top-[14px] right-[14px] rounded-full bg-black/60 px-[9px] py-[5px] text-[12px] font-bold text-white">{time}</span>
      <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/94 text-ink shadow-play">
        <Icon name="play" size={30} strokeWidth={0} />
      </span>
      <span className={`absolute inset-x-0 bottom-0 bg-linear-to-b from-black/0 to-black/55 px-4 py-[18px] font-display font-bold leading-[1.2] text-white ${captionClass}`}>{caption}</span>
    </OpenDemo>
  );
}
