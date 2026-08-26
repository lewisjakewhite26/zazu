import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Zazu",
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen dawn-gradient py-24 px-6">
      <div className="max-w-[800px] mx-auto glass-card rounded-3xl p-8 md:p-12">
        <div className="mb-8 border-b border-[var(--color-ink)] border-opacity-10 pb-8 flex items-center justify-between">
          <h1 className="font-serif text-[48px] text-[var(--color-ink)] leading-none">
            Privacy Policy
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
          <h2>Who runs Zazu</h2>
          <p>
            Zazu is developed and operated by Lewis White, an individual developer based in the United Kingdom.
            This policy explains what information Zazu collects, why, and how you can control it.
          </p>

          <h2>What we collect</h2>
          <p>Zazu is a vocabulary alarm clock app. Depending on how you use it, we collect:</p>
          <ul>
            <li>
              <strong>Account identity</strong> — if you sign in with Apple or Google, we receive your name
              and email address from that provider, via our authentication provider Supabase, so we can
              create and secure your account.
            </li>
            <li>
              <strong>Learning progress</strong> — your streak, coins, and word-mastery history, so your
              progress is saved and can sync across devices. If you use the app as a guest without signing
              in, this is instead stored only on your device and never sent to us.
            </li>
            <li>
              <strong>Subscription status</strong> — if you purchase Zazu Gold, our subscription provider
              RevenueCat tells us your entitlement status (e.g. &ldquo;active Gold subscriber&rdquo;) so the app can
              unlock the right features. Billing itself is handled entirely by the Apple App Store or
              Google Play — we never see or store your payment card details.
            </li>
          </ul>

          <h2>What we don&rsquo;t collect</h2>
          <p>
            Zazu does not use advertising networks, analytics SDKs, or any third-party tracking or
            crash-reporting tools. We don&rsquo;t sell or share your data with advertisers, because there aren&rsquo;t
            any in this app.
          </p>

          <h2>Who we share data with</h2>
          <p>We use a small number of service providers to run Zazu, each acting only on our instructions:</p>
          <ul>
            <li><strong>Supabase</strong> — hosts our database and handles sign-in.</li>
            <li><strong>RevenueCat</strong> — manages subscription entitlements.</li>
            <li>
              <strong>Apple / Google</strong> — process sign-in and, where applicable, subscription
              payments through the App Store or Google Play.
            </li>
          </ul>
          <p>We do not otherwise sell, rent, or share your personal data with third parties.</p>

          <h2>Your rights</h2>
          <p>You can access, correct, or delete your data at any time:</p>
          <ul>
            <li>
              In the app: <strong>Settings → Delete account</strong> permanently removes your account and
              associated data.
            </li>
            <li>
              By email: contact us at{" "}
              <a href="mailto:support@zazu.org.uk">support@zazu.org.uk</a> for any data access,
              correction, or deletion request.
            </li>
          </ul>
          <p>
            If you are in the UK or EU, you have rights under UK GDPR / EU GDPR to access, correct, port,
            or erase your personal data, and to object to or restrict its processing. We aim to respond to
            any request within 30 days.
          </p>

          <h2>Data retention</h2>
          <p>
            We keep your account data for as long as your account is active. If you delete your account,
            your data is permanently removed from our systems (subscription records may be retained by
            Apple/Google/RevenueCat per their own policies, outside our control).
          </p>

          <h2>Children&rsquo;s privacy</h2>
          <p>
            Zazu is not directed at children under 13, and we do not knowingly collect personal
            information from children under that age. If you believe a child has provided us with
            personal data, please contact us and we will delete it.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            If we make material changes to this policy, we&rsquo;ll update the &ldquo;Last updated&rdquo; date above
            and, where appropriate, notify you in the app.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about this policy or your data? Email{" "}
            <a href="mailto:support@zazu.org.uk">support@zazu.org.uk</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
