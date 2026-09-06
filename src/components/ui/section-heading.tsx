interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  inverse?: boolean;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  inverse = false,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow ? (
        <p className={`mb-3 text-[11px] font-extrabold uppercase tracking-[0.18em] ${inverse ? "text-[#f5cc73]" : "text-[var(--red-700)]"}`}>
          {eyebrow}
        </p>
      ) : null}
      <h2 className={`heading-section text-balance ${inverse ? "text-white" : "text-[var(--navy-950)]"}`}>{title}</h2>
      {description ? (
        <p className={`mt-3 text-[0.95rem] leading-7 md:text-base ${inverse ? "text-white/70" : "text-[var(--text-muted)]"}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
