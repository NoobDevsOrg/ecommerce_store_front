"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/**
 * Fade up + stagger for a container's children
 * @param {object} options - { stagger, duration, y, delay, start }
 */
export function useGsapFadeUp(options = {}) {
    const ref = useRef(null);
    const {
        stagger = 0.12,
        duration = 1,
        y = 40,
        delay = 0,
        start = "top 85%",
        childSelector = null,
    } = options;

    useEffect(() => {
        if (!ref.current) return;
        const targets = childSelector
            ? ref.current.querySelectorAll(childSelector)
            : ref.current.children;

        if (!targets.length) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                targets,
                { opacity: 0, y, willChange: "transform, opacity" },
                {
                    opacity: 1,
                    y: 0,
                    duration,
                    stagger,
                    delay,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ref.current,
                        start,
                        once: true,
                    },
                }
            );
        }, ref);

        return () => ctx.revert();
    }, [stagger, duration, y, delay, start, childSelector]);

    return ref;
}

/**
 * Simple single-element fade-in on scroll
 */
export function useGsapReveal(options = {}) {
    const ref = useRef(null);
    const { duration = 1.2, y = 30, delay = 0, start = "top 88%" } = options;

    useEffect(() => {
        if (!ref.current) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ref.current,
                { opacity: 0, y, willChange: "transform, opacity" },
                {
                    opacity: 1,
                    y: 0,
                    duration,
                    delay,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ref.current,
                        start,
                        once: true,
                    },
                }
            );
        }, ref);
        return () => ctx.revert();
    }, [duration, y, delay, start]);

    return ref;
}

/**
 * Horizontal line reveal (for decorative separators)
 */
export function useGsapLineReveal(options = {}) {
    const ref = useRef(null);
    const { delay = 0, start = "top 90%" } = options;

    useEffect(() => {
        if (!ref.current) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ref.current,
                { scaleX: 0, transformOrigin: "left center" },
                {
                    scaleX: 1,
                    duration: 1.4,
                    delay,
                    ease: "power4.inOut",
                    scrollTrigger: {
                        trigger: ref.current,
                        start,
                        once: true,
                    },
                }
            );
        }, ref);
        return () => ctx.revert();
    }, [delay, start]);

    return ref;
}

/**
 * Counter animation (for stats/numbers)
 */
export function useGsapCounter(target, options = {}) {
    const ref = useRef(null);
    const { duration = 2, delay = 0 } = options;

    useEffect(() => {
        if (!ref.current) return;
        const ctx = gsap.context(() => {
            const obj = { val: 0 };
            gsap.to(obj, {
                val: target,
                duration,
                delay,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: ref.current,
                    start: "top 85%",
                    once: true,
                },
                onUpdate: () => {
                    if (ref.current) ref.current.textContent = Math.round(obj.val);
                },
            });
        }, ref);
        return () => ctx.revert();
    }, [target, duration, delay]);

    return ref;
}