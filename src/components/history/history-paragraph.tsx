export function HistoryParagraph({ text }: { text: string }) {
  return (
    <p className="[text-wrap:pretty]">
      {text.split(/(\*\*.*?\*\*)/g).map((part, index) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={index} className="font-semibold text-[var(--navy-950)]">{part.slice(2, -2)}</strong>
        ) : part,
      )}
    </p>
  );
}
