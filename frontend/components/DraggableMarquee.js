"use client";

import { useEffect, useRef } from "react";

export default function DraggableMarquee({
  children,
  className = "",
  trackSelector,
  isPaused = false,
}) {
  const containerRef = useRef(null);
  const dragRef = useRef(null);
  const isPausedRef = useRef(isPaused);
  const momentumFrameRef = useRef(null);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let suppressClick = false;
    let clickResetFrame;
    const dragDamping = 0.55;
    const momentumDuration = 420;

    function stopMomentum() {
      if (momentumFrameRef.current) {
        cancelAnimationFrame(momentumFrameRef.current);
        momentumFrameRef.current = null;
      }
    }

    function startMomentum(drag) {
      const initialVelocity =
        (drag.velocity / drag.halfWidth) *
        drag.duration *
        drag.direction *
        dragDamping;
      if (!drag.moved || Math.abs(initialVelocity) < 0.01) return;

      const startedAt = performance.now();

      function animateMomentum(now) {
        const progress = Math.min(
          1,
          (now - startedAt) / momentumDuration
        );
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const timeDelta =
          initialVelocity * momentumDuration * easedProgress;

        drag.animation.currentTime = Math.max(
          0,
          drag.releaseTime + timeDelta
        );

        if (progress < 1 && !isPausedRef.current) {
          momentumFrameRef.current = requestAnimationFrame(animateMomentum);
        } else {
          momentumFrameRef.current = null;
          if (!isPausedRef.current) drag.animation.play();
        }
      }

      momentumFrameRef.current = requestAnimationFrame(animateMomentum);
    }

    function onPointerDown(event) {
      if (event.button !== 0 && event.pointerType === "mouse") return;
      if (event.target.closest("button")) return;

      const track = event.target.closest(trackSelector);
      if (!track || !container.contains(track)) return;

      stopMomentum();

      const animation = track
        .getAnimations()
        .find((item) => item.effect);

      if (!animation) return;

      const duration = animation.effect.getTiming().duration;
      const halfWidth = track.scrollWidth / 2;

      if (
        typeof duration !== "number" ||
        !Number.isFinite(duration) ||
        duration <= 0 ||
        halfWidth <= 0
      ) {
        return;
      }

      animation.pause();
      event.currentTarget.setPointerCapture(event.pointerId);

      dragRef.current = {
        pointerId: event.pointerId,
        track,
        animation,
        startX: event.clientX,
        startTime: Number(animation.currentTime) || 0,
        wasPaused: isPausedRef.current,
        duration,
        halfWidth,
        lastX: event.clientX,
        lastTime: performance.now(),
        velocity: 0,
        direction: track.classList.contains("collection-marquee-right")
          ? 1
          : -1,
        moved: false,
      };

      track.style.cursor = "grabbing";
    }

    function onPointerMove(event) {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      const deltaX = event.clientX - drag.startX;
      const now = performance.now();
      const elapsed = now - drag.lastTime;

      if (Math.abs(deltaX) > 4) {
        drag.moved = true;
      }

      if (elapsed > 0) {
        const velocity = (event.clientX - drag.lastX) / elapsed;
        drag.velocity = drag.velocity * 0.7 + velocity * 0.3;
      }

      drag.lastX = event.clientX;
      drag.lastTime = now;

      if (!drag.moved) return;

      event.preventDefault();

      const timeDelta =
        (deltaX / drag.halfWidth) * drag.duration * drag.direction * dragDamping;

      drag.animation.currentTime = Math.max(
        0,
        drag.startTime + timeDelta
      );
    }

    function finishDrag(event) {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      drag.track.style.cursor = "";

      if (drag.moved) {
        drag.releaseTime = Number(drag.animation.currentTime) || 0;
        suppressClick = true;
        cancelAnimationFrame(clickResetFrame);
        clickResetFrame = requestAnimationFrame(() => {
          suppressClick = false;
        });
      }

      if (!drag.wasPaused && !isPausedRef.current) {
        if (drag.moved) startMomentum(drag);
        else drag.animation.play();
      }
      dragRef.current = null;
    }

    function onClick(event) {
      if (!suppressClick) return;
      event.preventDefault();
      event.stopPropagation();
      suppressClick = false;
      cancelAnimationFrame(clickResetFrame);
    }

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove, {
      passive: false,
    });
    container.addEventListener("pointerup", finishDrag);
    container.addEventListener("pointercancel", finishDrag);
    container.addEventListener("click", onClick, true);

    return () => {
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", finishDrag);
      container.removeEventListener("pointercancel", finishDrag);
      container.removeEventListener("click", onClick, true);
      stopMomentum();
      cancelAnimationFrame(clickResetFrame);
    };
  }, [trackSelector]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.querySelectorAll(trackSelector).forEach((track) => {
      const animation = track
        .getAnimations()
        .find((item) => item.effect);

      if (!animation) return;

      if (isPaused) animation.pause();
      else if (!dragRef.current) animation.play();
    });
  }, [isPaused, trackSelector]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ touchAction: "pan-y" }}
    >
      {children}
    </div>
  );
}
