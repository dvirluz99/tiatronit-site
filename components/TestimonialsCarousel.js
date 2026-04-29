'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

// Stacked-deck testimonials carousel.
// - Renders all items, positions them via data-state ("front" / "behind-1" /
//   "behind-2" / "hidden" / "exit-prev" / "exit-next"). CSS handles the look.
// - Stable React keys (recommendationId or fallback) so cards don't remount
//   when the deck advances — fixes the flicker the old grid had.
// - Optional autoplay; pauses while pointer is over the deck.
export default function TestimonialsCarousel({
  testimonials = [],
  autoplaySeconds = 0,
}) {
  const items = Array.isArray(testimonials) ? testimonials.filter(Boolean) : [];
  const total = items.length;

  const [index, setIndex] = useState(0);
  const [exitDir, setExitDir] = useState(null); // 'prev' | 'next' | null
  const exitingIndexRef = useRef(null);
  const animTimerRef = useRef(null);
  const [paused, setPaused] = useState(false);

  // Touch swipe
  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);
  const minSwipeDistance = 50;

  function clearAnimTimer() {
    if (animTimerRef.current) {
      clearTimeout(animTimerRef.current);
      animTimerRef.current = null;
    }
  }

  // Advance the deck. We update `index` immediately and mark the leaving card
  // via `exitingIndexRef` so that the leaving card animates to its exit
  // transform while every other card slides forward to its new slot in the same
  // frame. Updating index only after the timeout caused the back cards to stay
  // frozen and snap at the end — the "reflection" jump.
  function advance(dir) {
    if (total < 2) return;
    if (animTimerRef.current) return;
    const fromIndex = index;
    const nextIndex =
      dir === 'next' ? (fromIndex + 1) % total : (fromIndex - 1 + total) % total;
    exitingIndexRef.current = fromIndex;
    setExitDir(dir);
    setIndex(nextIndex);
    animTimerRef.current = setTimeout(() => {
      setExitDir(null);
      exitingIndexRef.current = null;
      animTimerRef.current = null;
    }, 380);
  }

  function jumpTo(target) {
    if (total < 2 || target === index || animTimerRef.current) return;
    const fromIndex = index;
    const dir = target > fromIndex ? 'next' : 'prev';
    const nextIndex = ((target % total) + total) % total;
    exitingIndexRef.current = fromIndex;
    setExitDir(dir);
    setIndex(nextIndex);
    animTimerRef.current = setTimeout(() => {
      setExitDir(null);
      exitingIndexRef.current = null;
      animTimerRef.current = null;
    }, 380);
  }

  // Autoplay
  useEffect(() => {
    if (!autoplaySeconds || autoplaySeconds <= 0) return;
    if (paused || total < 2) return;
    const t = setTimeout(() => advance('next'), autoplaySeconds * 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplaySeconds, paused, index, total]);

  useEffect(() => () => clearAnimTimer(), []);

  function onTouchStart(e) {
    touchEndRef.current = null;
    touchStartRef.current = e.targetTouches[0].clientX;
  }
  function onTouchMove(e) {
    touchEndRef.current = e.targetTouches[0].clientX;
  }
  function onTouchEnd() {
    const start = touchStartRef.current;
    const end = touchEndRef.current;
    if (start == null || end == null) return;
    const distance = start - end;
    if (distance > minSwipeDistance) advance('next');
    else if (distance < -minSwipeDistance) advance('prev');
  }

  if (total === 0) return null;

  // Map every item to a slot label. The "exiting" item gets exit-prev/exit-next;
  // the new front becomes "front" immediately so it slides in from the deck.
  function stateFor(i) {
    if (exitDir && i === exitingIndexRef.current) {
      return exitDir === 'next' ? 'exit-next' : 'exit-prev';
    }
    const offset = (i - index + total) % total;
    if (offset === 0) return 'front';
    if (offset === 1) return 'behind-1';
    if (offset === 2 && total > 3) return 'behind-2';
    return 'hidden';
  }

  return (
    <section
      className="carousel-section"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <h2 className="carousel-title">לקוחות מספרים</h2>

      <div
        className="carousel-container"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <button
          type="button"
          onClick={() => advance('prev')}
          className="carousel-btn carousel-btn-prev"
          aria-label="הקודם"
          disabled={total < 2}
        >
          <i className="fas fa-chevron-right"></i>
        </button>

        <div className="carousel-deck" aria-live="polite">
          {items.map((item, i) => {
            const state = stateFor(i);
            const key = item.recommendationId || `${item.author || ''}-${i}`;
            const cardInner = (
              <>
                <div className="carousel-watermark" aria-hidden="true">❝</div>
                <div className="carousel-quote-icon" aria-hidden="true">❝</div>
                <p className="carousel-text">{item.text}</p>
                <div className="carousel-attribution">
                  <div className="carousel-author">{item.author}</div>
                  {item.fromShowTitle && (
                    <span className="carousel-show-name">{item.fromShowTitle}</span>
                  )}
                </div>
              </>
            );

            const isFront = state === 'front';
            const isInteractive = isFront && !exitDir;
            const className = `carousel-card carousel-card--${state}`;

            // Behind cards aren't focusable / keyboard-clickable — they advance the deck.
            if (!isInteractive) {
              return (
                <div
                  key={key}
                  className={className}
                  data-state={state}
                  aria-hidden={state !== 'front'}
                  onClick={
                    state === 'behind-1' || state === 'behind-2' ? () => advance('next') : undefined
                  }
                >
                  {cardInner}
                </div>
              );
            }

            return item.recommendationId ? (
              <Link
                key={key}
                href={`/recommendation/${item.recommendationId}`}
                className={className}
                data-state={state}
              >
                {cardInner}
              </Link>
            ) : (
              <div key={key} className={className} data-state={state}>
                {cardInner}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => advance('next')}
          className="carousel-btn carousel-btn-next"
          aria-label="הבא"
          disabled={total < 2}
        >
          <i className="fas fa-chevron-left"></i>
        </button>
      </div>

      {total > 1 && (
        <div className="carousel-dots" role="tablist" aria-label="ניווט המלצות">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`המלצה ${i + 1} מתוך ${total}`}
              className={`carousel-dot ${i === index ? 'active' : ''}`}
              onClick={() => jumpTo(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
