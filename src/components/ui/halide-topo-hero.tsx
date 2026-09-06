"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import styles from "./halide-topo-hero.module.css";

export function HalideTopoHero({ className }: { className?: string }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const sceneTitleRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const interfaceRef = useRef<HTMLDivElement>(null);
  const bloomRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const root = rootRef.current;
    const bg = bgRef.current;
    const scTitle = sceneTitleRef.current;
    const mid = midRef.current;
    const front = frontRef.current;
    const ui = interfaceRef.current;
    const bloom = bloomRef.current;
    const vignette = vignetteRef.current;

    if (!outer || !root || !bg || !scTitle || !mid || !front || !ui || !bloom || !vignette)
      return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const finePointer = window.matchMedia("(pointer: fine)");

    if (reducedMotion.matches) {
      root.dataset.ready = "true";
      return;
    }

    // --- Effect 1: Entrance ---
    const entranceTimer = window.setTimeout(() => {
      root.dataset.ready = "true";
    }, 120);

    const entranceDoneTimer = window.setTimeout(() => {
      root.dataset.live = "true";
    }, 2800);

    // --- State ---
    let mouseX = 0;
    let mouseY = 0;
    let smoothX = 0;
    let smoothY = 0;
    let scrollProgress = 0;
    let rafId = 0;
    let needsUpdate = false;

    // --- Effect 2: Mouse parallax ---
    const handlePointerMove = (event: PointerEvent) => {
      if (!finePointer.matches) return;
      const rect = root.getBoundingClientRect();
      mouseX = (event.clientX - rect.left) / rect.width - 0.5;
      mouseY = (event.clientY - rect.top) / rect.height - 0.5;
      scheduleUpdate();
    };

    const handlePointerLeave = () => {
      mouseX = 0;
      mouseY = 0;
      scheduleUpdate();
    };

    // --- Effect 3: Scroll zoom ---
    const handleScroll = () => {
      if (!finePointer.matches || !outer) return;
      const rect = outer.getBoundingClientRect();
      const heroH = window.innerHeight;
      const scrollable = outer.offsetHeight - heroH;
      if (scrollable <= 0) return;
      scrollProgress = Math.max(0, Math.min(1, -rect.top / scrollable));
      scheduleUpdate();
    };

    function scheduleUpdate() {
      if (!needsUpdate) {
        needsUpdate = true;
        rafId = requestAnimationFrame(update);
      }
    }

    function update() {
      needsUpdate = false;
      if (!root || !bg || !scTitle || !mid || !front || !ui || !vignette) return;

      smoothX += (mouseX - smoothX) * 0.06;
      smoothY += (mouseY - smoothY) * 0.06;

      const w = root.offsetWidth;
      const h = root.offsetHeight;
      const mx = smoothX * w;
      const my = smoothY * h;
      const p = scrollProgress;

      const bgScale = 1.05 + p * 0.35;
      const titleScale = 1 + p * 1.0;
      const midScale = 1 + p * 2.2;
      const frontScale = 1 + p * 1.2;
      const textOpacity = Math.max(0, 1 - p * 4);
      const vignetteOpacity = Math.max(0, p * 2 - 0.2);
      const heroOpacity = p > 0.7 ? Math.max(0, 1 - (p - 0.7) * 3.3) : 1;

      bg.style.transform = `translate3d(${mx * 0.01}px, ${my * 0.01}px, 0) scale(${bgScale})`;
      scTitle.style.transform = `translate3d(${mx * 0.03}px, ${my * 0.02}px, 0) scale(${titleScale})`;
      scTitle.style.opacity = String(textOpacity);
      mid.style.transform = `translate3d(${mx * 0.045}px, ${my * 0.03}px, 0) scale(${midScale})`;
      front.style.transform = `translate3d(${mx * 0.025}px, ${my * 0.02}px, 0) scale(${frontScale})`;
      ui.style.transform = `translate3d(${mx * -0.015}px, ${my * -0.01}px, 0)`;
      ui.style.opacity = String(textOpacity);
      vignette.style.opacity = String(vignetteOpacity);
      root.style.opacity = String(heroOpacity);

      if (
        Math.abs(mouseX - smoothX) > 0.0005 ||
        Math.abs(mouseY - smoothY) > 0.0005
      ) {
        scheduleUpdate();
      }
    }

    // --- Mobile: gentle floating ---
    let floatRaf: number | null = null;
    if (!finePointer.matches) {
      let t = 0;
      const float = () => {
        t += 0.006;
        mouseX = Math.sin(t) * 0.12;
        mouseY = Math.cos(t * 0.7) * 0.08;
        scheduleUpdate();
        floatRaf = requestAnimationFrame(float);
      };
      floatRaf = requestAnimationFrame(float);
    }

    root.addEventListener("pointermove", handlePointerMove);
    root.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.clearTimeout(entranceTimer);
      window.clearTimeout(entranceDoneTimer);
      cancelAnimationFrame(rafId);
      root.removeEventListener("pointermove", handlePointerMove);
      root.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("scroll", handleScroll);
      if (floatRaf !== null) cancelAnimationFrame(floatRaf);
    };
  }, []);

  return (
    <div ref={outerRef} className={styles.heroOuter}>
      <section
        ref={rootRef}
        className={cn(styles.hero, className)}
        aria-labelledby="home-hero-title"
      >
        <div className={styles.scene}>
          <div ref={bgRef} className={styles.backgroundLayer} aria-hidden="true">
            <Image
              src="/images/hero-bg.avif"
              alt=""
              fill
              priority
              sizes="100vw"
              className={styles.backgroundImage}
            />
          </div>
          <div className={styles.backgroundShade} aria-hidden="true" />
          <div ref={bloomRef} className={styles.lightBloom} aria-hidden="true" />
          <div className={styles.contours} aria-hidden="true" />
          <div ref={sceneTitleRef} className={styles.sceneTitle}>
            <h1 id="home-hero-title" className={styles.sceneTitleText}>
              Роуп Скиппинг
              <span className={styles.sceneTitleSub}>Республики Крым</span>
            </h1>
          </div>
          <div ref={midRef} className={styles.midLayer} aria-hidden="true">
            <Image
              src="/images/hero-two-athlets.avif"
              alt=""
              fill
              priority
              sizes="(max-width: 900px) 140vw, 100vw"
              className={styles.layerImage}
            />
          </div>
          <div ref={frontRef} className={styles.frontLayer} aria-hidden="true">
            <Image
              src="/images/hero-one-athlet.avif"
              alt=""
              fill
              priority
              sizes="(max-width: 900px) 140vw, 100vw"
              className={styles.layerImage}
            />
          </div>
          <div ref={vignetteRef} className={styles.scrollVignette} aria-hidden="true" />
        </div>

        <div ref={interfaceRef} className={styles.interface}>
          <div className={styles.kicker}>
            Федерация Роуп Скиппинга Республики Крым
          </div>
          <div className={styles.meta}>
            <span>Официальный информационный портал</span>
            <span>Календарь · документы · развитие</span>
          </div>

          <div className={styles.titleWrap}>
            <p className={styles.subtitle}>
              Соревнования, обучение, муниципалитеты и официальные материалы
              Федерации — в одном месте.
            </p>
          </div>

          <div className={styles.bottom}>
            <div className={styles.archive}>
              <span>Спорт · движение · сообщество</span>
            </div>

            <div className={styles.ctaGroup}>
              <Link href="/documents" className={styles.secondaryCta}>
                <FileText size={17} aria-hidden="true" />
                Документы
              </Link>
              <Link href="/calendar" className={styles.cta}>
                Смотреть календарь
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.scrollHint} aria-hidden="true" />
      </section>
    </div>
  );
}
