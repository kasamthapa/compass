// TEMPORARY, just-for-fun note. To remove it: delete this file and the import
// + <LoveNote /> line in src/pages/TodayPage.tsx.
export function LoveNote() {
  return (
    <section
      aria-label="A note"
      className="mb-4 flex flex-col items-center rounded-lg bg-surface px-5 py-6 text-center shadow-card"
    >
      <svg viewBox="0 0 24 24" className="breathe-pulse h-[36px] w-[36px] text-seal" aria-hidden="true">
        <path
          d="M12 20.5C4.5 15.2 2.5 11.8 2.5 8.6 2.5 6.2 4.3 4.5 6.6 4.5c2.1 0 4.3 1.2 5.4 3.5 1.1-2.3 3.3-3.5 5.4-3.5 2.3 0 4.1 1.7 4.1 4.1 0 3.2-2 6.6-9.5 11.9z"
          fill="currentColor"
        />
        <circle cx="20.6" cy="3.6" r="0.95" fill="var(--brass)" />
      </svg>
      <p className="mt-3 font-display text-title font-medium italic text-text">I love you, Khusi</p>
    </section>
  )
}
