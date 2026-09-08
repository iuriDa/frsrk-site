"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ArrowRight, Building2, GraduationCap, School, Sparkles } from "lucide-react";
import { municipalitiesTagline, trainingFormats } from "@/content/municipalities-overview";
import { fetchTrainingData, getVisibleTrainingCities, type TrainingData } from "@/lib/where-to-train";
import styles from "./municipalities-data-story.module.css";

const formatIcons: Record<string, typeof Building2> = {
  academy: GraduationCap,
  clubs: Building2,
  studios: Sparkles,
  "school-league": School,
};

const RING_GAP_DEG = 3;

export function MunicipalitiesDataStory() {
  const [data, setData] = useState<TrainingData>({ cities: [], organizations: [] });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    void fetchTrainingData()
      .then((next) => {
        if (!active) return;
        setData(next);
        setLoaded(true);
      })
      .catch(() => {
        if (active) setLoaded(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const visibleCities = getVisibleTrainingCities(data);
    const visibleCityIds = new Set(visibleCities.map((city) => city.id));
    const activeOrganizations = data.organizations.filter(
      (organization) => organization.active && visibleCityIds.has(organization.cityId),
    );
    const schoolCityIds = new Set(
      activeOrganizations
        .filter((organization) => organization.organizationType === "school")
        .map((organization) => organization.cityId),
    );
    return {
      territories: visibleCities.length,
      schoolTerritories: schoolCityIds.size,
      formats: new Set(activeOrganizations.map((organization) => organization.organizationType)).size,
    };
  }, [data]);

  const value = (count: number) => (loaded ? String(count) : "—");

  const schoolLeagueDeg = stats.territories > 0 ? (stats.schoolTerritories / stats.territories) * 360 : 0;
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
                {value(stats.territories)}
              </p>
              <p className={styles.numberLabel}>муниципальных территорий</p>
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
                  {value(stats.schoolTerritories)}
                </p>
                <p className={styles.numberLabel}>территорий со школьными организациями</p>
              </div>
              <div>
                <span className={styles.connector} data-tone="red" aria-hidden="true" />
                <p className={styles.bigNumber} data-tone="red">
                  {value(stats.formats)}
                </p>
                <p className={styles.numberLabel}>форматов организаций</p>
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
