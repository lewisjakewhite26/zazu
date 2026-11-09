import type { Metadata } from "next";

import Legal from "@/components/site/Legal";

export const metadata: Metadata = {
  title: "Terms of Service | Zazu",
};

export default function TermsOfService() {
  return (
    <Legal title="Terms of Service" updated="26 August 2026">
          <h2>Acceptance of these terms</h2>
          <p>
            Zazu is developed and operated by Lewis White (&ldquo;we&rdquo;, &ldquo;us&rdquo;). By downloading,
            installing, or using the Zazu app, you agree to these Terms of Service. If you don&rsquo;t agree,
            please don&rsquo;t use the app.
          </p>

          <h2>The service</h2>
          <p>
            Zazu is a vocabulary alarm clock. It wakes you up and asks you to answer a short word-learning
            task before the alarm can be dismissed. Some features, such as extra word packs and unlimited
            practice, are available as part of a paid &ldquo;Zazu Gold&rdquo; subscription.
          </p>

          <h2>Accounts</h2>
          <p>
            You can use Zazu as a guest, or sign in with Google to save your progress and sync
            it across devices. You&rsquo;re responsible for keeping your sign-in credentials secure, and for
            all activity that happens under your account.
          </p>

          <h2>Subscriptions and billing</h2>
          <ul>
            <li>
              <strong>Billing.</strong> Zazu Gold is a subscription purchased through Google Play
              and billed by Google directly. We never see or store your payment details.
            </li>
            <li>
              <strong>Renewal.</strong> Subscriptions renew automatically until cancelled. You can manage or
              cancel your subscription at any time in your Google Play account settings.
            </li>
            <li>
              <strong>Refunds.</strong> Handled by Google according to their own refund policies,
              not by us directly.
            </li>
            <li>
              <strong>RevenueCat.</strong> We use RevenueCat to keep track of which features your
              subscription unlocks. Google remains the merchant of record.
            </li>
          </ul>

          <h2>Acceptable use</h2>
          <p>
            Please don&rsquo;t use Zazu to attempt to disrupt the service, reverse-engineer the app beyond
            what&rsquo;s permitted by law, or use it for any unlawful purpose. We may suspend or terminate
            accounts that misuse the service.
          </p>

          <h2>Intellectual property</h2>
          <p>
            The Zazu app, its design, word content, and branding are owned by us or licensed to us, and
            are protected by copyright and other intellectual property laws. You may use the app for
            personal, non-commercial purposes only.
          </p>

          <h2>Disclaimers</h2>
          <p>
            Zazu is provided &ldquo;as is&rdquo;. While we work hard to make sure alarms fire reliably, we
            can&rsquo;t guarantee the app will be error-free or available at all times. For anything
            safety-critical, such as medication or appointments you cannot miss, please use a dedicated,
            redundant alarm method as well. To the fullest extent permitted by law, we are not liable for
            missed alarms, lost data, or indirect damages arising from your use of the app.
          </p>

          <h2>Termination</h2>
          <p>
            You can stop using Zazu and delete your account at any time (<strong>Settings → Delete
            account</strong>, or by emailing us). We may suspend or terminate your access if you materially
            breach these terms.
          </p>

          <h2>Changes to these terms</h2>
          <p>
            We may update these terms from time to time. If we make material changes, we&rsquo;ll update the
            &ldquo;Last updated&rdquo; date above and, where appropriate, notify you in the app.
          </p>

          <h2>Governing law</h2>
          <p>These terms are governed by the laws of England and Wales.</p>

          <h2>Contact</h2>
          <p>
            Questions about these terms? Email <a href="mailto:support@zazu.org.uk">support@zazu.org.uk</a>.
          </p>
    </Legal>
  );
}
