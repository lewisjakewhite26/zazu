import type { Metadata } from "next";

import Legal from "@/components/site/Legal";

export const metadata: Metadata = {
  title: "Accessibility Statement | Zazu",
};

export default function AccessibilityStatement() {
  return (
    <Legal title="Accessibility Statement" updated="26 August 2026">
          <h2>Our commitment</h2>
          <p>
            Zazu is designed to be usable by everyone, including people using screen readers, larger text
            sizes, or with low vision. Readability is a core design goal. We design against a
            &ldquo;comfortable for a 70-year-old user&rdquo; bar, not just a technical minimum.
          </p>

          <h2>What&rsquo;s already in place</h2>
          <ul>
            <li>
              <strong>Touch targets.</strong> Every interactive element meets a minimum 44×44pt touch
              target size.
            </li>
            <li>
              <strong>Screen readers.</strong> Buttons, toggles, and controls throughout the app carry
              accessibility roles, labels, and state for TalkBack (Android).
            </li>
            <li>
              <strong>Colour contrast.</strong> Text and interface colours meet WCAG AA contrast ratios
              (4.5:1 or better) in both light and dark themes.
            </li>
            <li>
              <strong>Theming.</strong> Choose Light, Dark, or Auto (follows time of day), whichever is
              easiest for you to read.
            </li>
            <li>
              <strong>Adjustable snooze.</strong> Snooze duration can be tuned to what works for you rather
              than a fixed default.
            </li>
          </ul>

          <h2>Known limitations</h2>
          <p>
            We&rsquo;re not aware of any outstanding accessibility issues at this time, but we haven&rsquo;t
            yet completed a full third-party accessibility audit. If you run into something that
            doesn&rsquo;t work well with assistive technology, we want to know.
          </p>

          <h2>Feedback</h2>
          <p>
            If you experience any accessibility barrier using Zazu, please tell us. Email{" "}
            <a href="mailto:support@zazu.org.uk">support@zazu.org.uk</a> with as much detail as you can
            (device, assistive technology, what happened), and we&rsquo;ll look into it.
          </p>
    </Legal>
  );
}
