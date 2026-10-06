"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const revealFor = (section, desktop) => {
  const heading = section.querySelector("[data-showroom-heading]");
  const cards = gsap.utils.toArray(section.querySelectorAll("[data-showroom-card]"));
  const images = gsap.utils.toArray(section.querySelectorAll("[data-showroom-image]"));
  const type = section.dataset.motion || "stagger";
  const amount = desktop ? 34 : 18;
  if (!heading && !cards.length && !images.length) return;

  const timeline = gsap.timeline({ scrollTrigger: { trigger: section, start: type === "mask" || type === "split" ? "top 78%" : "top 82%", once: true } });
  const revealHeading = (from, at) => {
    if (heading) timeline.fromTo(heading, from, { autoAlpha: 1, x: 0, y: 0, duration: 0.7, ease: "power3.out" }, at);
  };
  const revealCards = (from, to, at) => {
    if (cards.length) timeline.fromTo(cards, from, { ...to, autoAlpha: 1, duration: 0.72, stagger: 0.09, ease: "power3.out" }, at);
  };

  if (type === "mask") {
    revealHeading({ autoAlpha: 0, x: amount });
    revealCards({ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)" }, "-=0.35");
    return;
  }
  if (type === "editorial") {
    if (images.length) timeline.fromTo(images, { scale: 1.1, clipPath: "inset(12% 0 0 0)" }, { scale: 1, clipPath: "inset(0 0 0 0)", duration: 1.05, ease: "power3.out" });
    revealHeading({ autoAlpha: 0, y: amount }, images.length ? "-=0.7" : undefined);
    return;
  }
  if (type === "split") {
    revealCards({ autoAlpha: 0, x: -amount }, { x: 0 }, 0);
    revealHeading({ autoAlpha: 0, x: amount }, cards.length ? "-=0.55" : 0);
    return;
  }

  revealHeading({ autoAlpha: 0, y: amount });
  revealCards({ autoAlpha: 0, y: amount, scale: type === "commerce" ? 0.94 : 0.98 }, { y: 0, scale: 1 }, "-=0.32");
};

export default function ShowroomMotion({ children }) {
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const context = gsap.context(() => {
      const media = gsap.matchMedia();
      media.add({ desktop: "(min-width: 1024px)", reduced: "(prefers-reduced-motion: reduce)" }, (scope) => {
        const { desktop, reduced } = scope.conditions;
        const sections = gsap.utils.toArray("[data-showroom-section]");
        const images = gsap.utils.toArray("[data-showroom-image]");
        if (reduced) {
          gsap.set(sections.flatMap((section) => [section, ...section.querySelectorAll("[data-showroom-heading], [data-showroom-card], [data-showroom-image]")]), { clearProps: "all" });
          return undefined;
        }

        sections.forEach((section) => revealFor(section, desktop));
        if (desktop) {
          images.forEach((image) => {
            gsap.to(image, { yPercent: -3.5, ease: "none", scrollTrigger: { trigger: image.closest("[data-showroom-section]") || image, start: "top bottom", end: "bottom top", scrub: 0.55 } });
          });
        }

        const cleanupHover = gsap.utils.toArray("[data-showroom-hover]").map((element) => {
          const image = element.querySelector("img");
          const arrow = element.querySelector("[data-showroom-arrow]");
          if (!image) return () => {};
          const enter = () => gsap.to(image, { scale: 1.045, duration: 0.55, ease: "power2.out", overwrite: "auto" });
          const leave = () => gsap.to(image, { scale: 1, duration: 0.6, ease: "power2.out", overwrite: "auto" });
          const enterArrow = () => arrow && gsap.to(arrow, { x: 5, duration: 0.25, ease: "power2.out", overwrite: "auto" });
          const leaveArrow = () => arrow && gsap.to(arrow, { x: 0, duration: 0.3, ease: "power2.out", overwrite: "auto" });
          element.addEventListener("pointerenter", enter);
          element.addEventListener("pointerleave", leave);
          element.addEventListener("pointerenter", enterArrow);
          element.addEventListener("pointerleave", leaveArrow);
          return () => { element.removeEventListener("pointerenter", enter); element.removeEventListener("pointerleave", leave); element.removeEventListener("pointerenter", enterArrow); element.removeEventListener("pointerleave", leaveArrow); };
        });
        const cleanupMagnetic = desktop ? gsap.utils.toArray("[data-magnetic]").map((button) => {
          const move = (event) => {
            const bounds = button.getBoundingClientRect();
            gsap.to(button, { x: ((event.clientX - bounds.left) / bounds.width - 0.5) * 8, y: ((event.clientY - bounds.top) / bounds.height - 0.5) * 6, duration: 0.24, ease: "power2.out", overwrite: "auto" });
          };
          const leave = () => gsap.to(button, { x: 0, y: 0, duration: 0.42, ease: "power3.out", overwrite: "auto" });
          button.addEventListener("pointermove", move);
          button.addEventListener("pointerleave", leave);
          return () => { button.removeEventListener("pointermove", move); button.removeEventListener("pointerleave", leave); };
        }) : [];
        const refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
        return () => { cancelAnimationFrame(refreshFrame); cleanupHover.forEach((cleanup) => cleanup()); cleanupMagnetic.forEach((cleanup) => cleanup()); };
      });
      return () => media.revert();
    }, root);
    return () => context.revert();
  }, []);

  return <div ref={rootRef}>{children}</div>;
}
