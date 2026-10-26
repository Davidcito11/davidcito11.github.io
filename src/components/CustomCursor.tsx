import { useEffect, useRef } from "react";
import "../styles/custom-cursor.css";

const MAX_TRAILS = 14;
const TRAIL_LIFETIME = 520;

const CustomCursor: React.FC = () => {
  const pointerRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const lastPointerRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2, time: performance.now() });
  const renderRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const dotRef = useRef<HTMLDivElement | null>(null);
  const pulseRef = useRef<HTMLDivElement | null>(null);
  const trailPoolRef = useRef<HTMLDivElement[]>([]);
  const hoverRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    if (isTouchDevice || prefersReducedMotion) {
      return;
    }

    const container = document.createElement("div");
    container.className = "custom-cursor";
    const dot = document.createElement("div");
    const pulse = document.createElement("div");
    const trails = document.createElement("div");

    dot.className = "cursor-dot";
    pulse.className = "cursor-pulse";
    trails.className = "cursor-trails";

    container.appendChild(dot);
    container.appendChild(pulse);
    container.appendChild(trails);
    document.body.appendChild(container);

    dotRef.current = dot;
    pulseRef.current = pulse;

    const trailPool = Array.from({ length: MAX_TRAILS }, () => {
      const trail = document.createElement("div");
      trail.className = "cursor-trail";
      trail.style.opacity = "0";
      trails.appendChild(trail);
      return trail;
    });
    trailPoolRef.current = trailPool;

    const updateCursorPosition = () => {
      const { x, y } = renderRef.current;
      container.style.transform = `translate3d(${x}px, ${y}px, 0)`;

      if (dotRef.current) {
        const scale = hoverRef.current ? 1.7 : 1;
        dotRef.current.style.transform = `translate(-50%, -50%) scale(${scale})`;
      }
    };

    const animateCursor = () => {
      renderRef.current.x += (pointerRef.current.x - renderRef.current.x) * 0.18;
      renderRef.current.y += (pointerRef.current.y - renderRef.current.y) * 0.18;
      updateCursorPosition();
      animationFrameRef.current = window.requestAnimationFrame(animateCursor);
    };

    const spawnTrail = (speedFactor: number) => {
      const trail = trailPoolRef.current.shift();
      if (!trail) return;

      trailPoolRef.current.push(trail);
      const size = hoverRef.current ? 30 : 22 + speedFactor * 10;
      const scale = hoverRef.current ? 1.2 + speedFactor * 0.9 : 1 + speedFactor;
      const glowOpacity = Math.min(0.95, 0.35 + speedFactor * 0.7);

      trail.style.width = `${size}px`;
      trail.style.height = `${size}px`;
      trail.style.opacity = `${glowOpacity}`;
      trail.style.transform = `translate(-50%, -50%) scale(${scale})`;
      trail.style.transition = "opacity 220ms ease, transform 260ms ease, width 220ms ease, height 220ms ease";

      requestAnimationFrame(() => {
        trail.style.opacity = `${Math.min(0.6, glowOpacity * 0.45)}`;
        trail.style.transform = `translate(-50%, -50%) scale(${scale + (hoverRef.current ? 1.2 : 1.6)})`;
      });

      setTimeout(() => {
        trail.style.opacity = "0";
        trail.style.transform = `translate(-50%, -50%) scale(${scale + (hoverRef.current ? 1.8 : 2.1)})`;
      }, 140);

      setTimeout(() => {
        trail.style.transition = "none";
        trail.style.opacity = "0";
      }, TRAIL_LIFETIME);
    };

    const triggerPulse = () => {
      if (!pulseRef.current) return;

      pulseRef.current.style.opacity = "0.85";
      pulseRef.current.style.transform = "translate(-50%, -50%) scale(0.8)";
      pulseRef.current.style.transition = "none";

      requestAnimationFrame(() => {
        pulseRef.current!.style.transition = "opacity 260ms ease, transform 260ms ease";
        pulseRef.current!.style.opacity = "0";
        pulseRef.current!.style.transform = "translate(-50%, -50%) scale(2.3)";
      });
    };

    const handlePointerMove = (event: MouseEvent | PointerEvent) => {
      const now = performance.now();
      const previous = lastPointerRef.current;
      const dx = event.clientX - previous.x;
      const dy = event.clientY - previous.y;
      const delta = Math.max(now - previous.time, 16);
      const distance = Math.hypot(dx, dy);
      const speedFactor = Math.min(distance / delta, 1.5);

      pointerRef.current = { x: event.clientX, y: event.clientY };
      lastPointerRef.current = { x: event.clientX, y: event.clientY, time: now };
      spawnTrail(speedFactor);
    };

    const handlePointerDown = (event: MouseEvent | PointerEvent) => {
      pointerRef.current = { x: event.clientX, y: event.clientY };
      triggerPulse();
    };

    const handlePointerOver = (event: Event) => {
      const target = event.target as HTMLElement | null;
      const interactive = !!target?.closest("a, button, input, textarea, select, [data-cursor-hover]");

      hoverRef.current = interactive;
      if (dotRef.current) {
        dotRef.current.classList.toggle("is-hovering", interactive);
      }
      updateCursorPosition();
    };

    const handlePointerOut = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      const related = event.relatedTarget as Node | null;

      if (target && related && target.contains(related)) {
        return;
      }

      hoverRef.current = false;
      if (dotRef.current) {
        dotRef.current.classList.remove("is-hovering");
      }
      updateCursorPosition();
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("mousemove", handlePointerMove);
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("pointerover", handlePointerOver, true);
    document.addEventListener("pointerout", handlePointerOut, true);
    window.addEventListener("resize", updateCursorPosition);
    window.addEventListener("scroll", updateCursorPosition, { passive: true });

    animationFrameRef.current = window.requestAnimationFrame(animateCursor);
    updateCursorPosition();

    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mousemove", handlePointerMove);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("pointerover", handlePointerOver, true);
      document.removeEventListener("pointerout", handlePointerOut, true);
      window.removeEventListener("resize", updateCursorPosition);
      window.removeEventListener("scroll", updateCursorPosition);
      container.remove();
    };
  }, []);

  return null;
};

export default CustomCursor;
