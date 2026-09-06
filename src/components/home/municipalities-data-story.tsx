import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight, Building2, GraduationCap, School, Sparkles } from "lucide-react";
import { municipalitiesOverviewStats, municipalitiesTagline, trainingFormats } from "@/content/municipalities-overview";
import styles from "./municipalities-data-story.module.css";

const formatIcons: Record<string, typeof Building2> = {
  academy: GraduationCap,
  clubs: Building2,
  studios: Sparkles,
  "school-league": School,
};

const RING_GAP_DEG = 3;

export function MunicipalitiesDataStory() {
  const territories = municipalitiesOverviewStats.find((stat) => stat.id === "territories")!;
  const schoolLeague = municipalitiesOverviewStats.find((stat) => stat.id === "school-league")!;
  const formatsStat = municipalitiesOverviewStats.find((stat) => stat.id === "formats")!;

  const schoolLeagueDeg = (schoolLeague.value / territories.value) * 360;
  const ringStyle = {
    "--ring-blue-end": `${schoolLeagueDeg - RING_GAP_DEG}deg`,
    "--ring-blue-full": `${schoolLeagueDeg}deg`,
    "--ring-muted-end": `${360 - RING_GAP_DEG}deg`,
  } as CSSProperties;

  return (
    <section className="section-space bg-white">
      <div className="site-container">
        <div className={styles.card}>
          <div className={styles.composition}>
            <div className={styles.left}>
              <p className={styles.eyebrow}>География роуп-скиппинга в Крыму</p>
              <p className={styles.bigNumber} data-tone="gold">
                {territories.value}
              </p>
              <p className={styles.numberLabel}>{territories.label}</p>
              <p className={styles.description}>
                Роуп скиппинг развивается по всей Республике Крым — в академиях, клубах, студиях и школьных секциях.
              </p>
            </div>

            <div className={styles.circleArea} aria-hidden="true">
              <div className={styles.circle}>
                <div className={styles.ring} style={ringStyle} />
                <div className={styles.silhouetteWrap}>
                  <Image
                    src="/images/municipalities/crimea-silhouette.png"
                    alt=""
                    fill
                    className={styles.silhouette}
                    sizes="(min-width: 1024px) 320px, 220px"
                  />
                </div>
              </div>
            </div>

            <div className={styles.right}>
              <div>
                <span className={styles.connector} data-tone="blue" aria-hidden="true" />
                <p className={styles.bigNumber} data-tone="blue">
                  {schoolLeague.value}
                </p>
                <p className={styles.numberLabel}>{schoolLeague.label}</p>
              </div>
              <div>
                <span className={styles.connector} data-tone="red" aria-hidden="true" />
                <p className={styles.bigNumber} data-tone="red">
                  {formatsStat.value}
                </p>
                <p className={styles.numberLabel}>{formatsStat.label}</p>
              </div>
            </div>

            <div className={styles.cta}>
              <Link href="/municipalities" className={styles.ctaButton}>
                Смотреть географию
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>

            <p className={styles.tagline}>
              {municipalitiesTagline.map((line) => (
                <span key={line} className={styles.taglineLine}>
                  {line}
                </span>
              ))}
            </p>

            <ul className={styles.formats}>
              {trainingFormats.map((format) => {
                const Icon = formatIcons[format.id] ?? Building2;
                return (
                  <li key={format.id} className={styles.formatItem}>
                    <Icon size={20} className={styles.formatIcon} aria-hidden="true" />
                    <span className={styles.formatTitle}>{format.title}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
