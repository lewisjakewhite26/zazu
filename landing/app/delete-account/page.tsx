import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Delete your account | Zazu",
  description: "How to delete your Zazu account and the data linked to it.",
};

export default function DeleteAccount() {
  return (
    <main className="min-h-screen bg-[var(--color-page)] py-24 px-6">
      <div className="max-w-[800px] mx-auto glass-card rounded-3xl p-8 md:p-12">
        <div className="mb-8 border-b border-[var(--color-ink)] border-opacity-10 pb-8 flex items-center justify-between gap-4">
          <h1 className="font-serif text-[40px] md:text-[48px] text-[var(--color-ink)] leading-none">
            Delete your account
          </h1>
          <Link
            href="/"
            className="text-[var(--color-ink)] opacity-70 hover:opacity-100 font-medium transition-opacity whitespace-nowrap"
          >
            ← Back home
          </Link>
        </div>

        <p className="text-[var(--color-subtext)] text-sm mb-8">Last updated: 8 November 2026</p>

        <div className="prose prose-lg text-[var(--color-ink)] max-w-none prose-headings:font-serif prose-headings:font-normal prose-a:text-[var(--color-gold)]">
          <p>
            Zazu is a vocabulary alarm clock app made by Lewis White. You can delete your Zazu account
            and the data linked to it at any time, in the app or by email.
          </p>

          <h2>Delete it in the app</h2>
          <ol>
            <li>Open Zazu and sign in.</li>
            <li>Go to <strong>Settings</strong>.</li>
            <li>Tap <strong>Delete account</strong>, then confirm.</li>
          </ol>
          <p>Your account is deleted straight away.</p>

          <h2>Delete it by email</h2>
          <p>
            If you no longer have the app, email{" "}
            <a href="mailto:support@zazu.org.uk?subject=Delete%20my%20Zazu%20account">support@zazu.org.uk</a>{" "}
            from the email address you signed in with, with the subject &ldquo;Delete my Zazu account&rdquo;.
            We&rsquo;ll delete your account and confirm by email within 30 days.
          </p>

          <h2>What gets deleted</h2>
          <ul>
            <li>Your account and sign-in details (name and email address)</li>
            <li>Your streak and coins</li>
            <li>Your word history and learning progress</li>
            <li>Your Zazu Gold status, if you have one</li>
          </ul>
          <p>This is permanent. We don&rsquo;t keep a copy once your account is deleted.</p>

          <h2>What isn&rsquo;t affected</h2>
          <ul>
            <li>
              <strong>Guest mode.</strong> If you never signed in, your progress is stored only on your
              phone. Uninstalling the app removes it.
            </li>
            <li>
              <strong>Subscriptions.</strong> Deleting your account doesn&rsquo;t cancel a Google Play
              subscription. Cancel it in the Play Store under Payments &amp; subscriptions. Google and
              RevenueCat may keep billing records under their own policies.
            </li>
          </ul>

          <p>
            More detail is in our <Link href="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </main>
  );
}
