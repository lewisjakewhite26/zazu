import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessibility Statement — Zazu",
};

export default function AccessibilityStatement() {
  return (
    <main className="min-h-screen dawn-gradient py-24 px-6">
      <div className="max-w-[800px] mx-auto glass-card rounded-3xl p-8 md:p-12">
        <div className="mb-8 border-b border-[var(--color-ink)] border-opacity-10 pb-8 flex items-center justify-between">
          <h1 className="font-serif text-[48px] text-[var(--color-ink)] leading-none">
            Accessibility Statement
          </h1>
          <Link
            href="/"
            className="text-[var(--color-ink)] opacity-70 hover:opacity-100 font-medium transition-opacity"
          >
            ← Back home
          </Link>
        </div>

        <p className="text-[var(--color-subtext)] text-sm mb-8">Last updated: 26 August 2026</p>

        <div className="prose prose-lg text-[var(--color-ink)] max-w-none prose-headings:font-serif prose-headings:font-normal prose-a:text-[var(--color-gold)]">
          <h2>Our commitment</h2>
          <p>
            Zazu is designed to be usable by everyone, including people using screen readers, larger text
            sizes, or with low vision. Readability is a core design goal — we design against a
            &ldquo;comfortable for a 70-year-old user&rdquo; bar, not just a technical minimum.
          </p>

          <h2>What&rsquo;s already in place</h2>
          <ul>
            <li><strong>Touch targets</strong> — every interactive element meets a minimum 44×44pt touch target size.</li>
            <li>
              <strong>Screen readers</strong> — buttons, toggles, and controls throughout the app carry
              accessibility roles, labels, and state for VoiceOver (iOS) and TalkBack (Android).
            </li>
            <li>
              <strong>Colour contrast</strong> — text and interface colours meet WCAG AA contrast ratios
              (4.5:1 or better) in both light and dark themes.
            </li>
            <li><strong>Theming</strong> — choose Light, Dark, or Auto (follows time of day), whichever is easiest for you to read.</li>
            <li><strong>Adjustable snooze</strong> — snooze duration can be tuned to what works for you rather than a fixed default.</li>
          </ul>

          <h2>Known limitations</h2>
          <p>
            We&rsquo;re not aware of any outstanding accessibility issues at this time, but we haven&rsquo;t yet
            completed a full third-party accessibility audit. If you run into something that doesn&rsquo;t
            work well with assistive technology, we want to know.
          </p>

          <h2>Feedback</h2>
          <p>
            If you experience any accessibility barrier using Zazu, please tell us — email{" "}
            <a href="mailto:support@zazu.org.uk">support@zazu.org.uk</a> with as much detail as you can
            (device, assistive technology, what happened), and we&rsquo;ll look into it.
          </p>
        </div>
      </div>
    </main>
  );
}
