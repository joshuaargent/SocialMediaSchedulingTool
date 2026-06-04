'use client';

import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';

export default function TermsAndConditionsPage() {
  return (
    <>
      <PageHeader 
        title="Terms and Conditions" 
        description="The terms governing use of our services"
        align="left"
      />

      <Container>
        <Card className="p-8">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="text-sm text-[var(--color-text-muted)] mb-6">Last updated: January 1, 2026</p>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using SMST (&quot;Social Media Scheduling Tool&quot;), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              SMST provides a platform for scheduling, publishing, and analyzing content across multiple social media platforms including TikTok, Facebook, Instagram, and YouTube. Our services include:
            </p>
            <ul>
              <li>Content scheduling and publishing</li>
              <li>Multi-platform social media management</li>
              <li>Analytics and performance tracking</li>
              <li>Media library management</li>
              <li>Content pipeline and production workflow tools</li>
            </ul>

            <h2>3. User Accounts</h2>
            <p>
              To access certain features, you must create an account. You are responsible for:
            </p>
            <ul>
              <li>Maintaining the confidentiality of your login credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
              <li>Providing accurate and complete information</li>
            </ul>

            <h2>4. Acceptable Use</h2>
            <p>
              You agree to use our services only for lawful purposes. You shall not:
            </p>
            <ul>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Post harmful, offensive, or inappropriate content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use automated tools to exceed reasonable usage limits</li>
              <li>Share your account credentials with others</li>
            </ul>

            <h2>5. Content Ownership</h2>
            <p>
              You retain ownership of all content you create and schedule through SMST. By using our services, you grant us a limited license to:
            </p>
            <ul>
              <li>Access and process your content to provide services</li>
              <li>Publish content to your connected social media platforms</li>
              <li>Generate analytics and insights about your content</li>
            </ul>

            <h2>6. Platform Connections</h2>
            <p>
              Our service integrates with third-party social media platforms through OAuth. You acknowledge that:
            </p>
            <ul>
              <li>We are not affiliated with TikTok, Facebook, Instagram, or YouTube</li>
              <li>Your use of these platforms is subject to their respective terms of service</li>
              <li>We are not responsible for the actions or policies of these platforms</li>
              <li>Platform availability and API access may change without notice</li>
            </ul>

            <h2>7. Service Availability</h2>
            <p>
              We strive to provide reliable services, but we cannot guarantee uninterrupted access. We reserve the right to:
            </p>
            <ul>
              <li>Modify, suspend, or discontinue services at any time</li>
              <li>Update features and functionality</li>
              <li>Set usage limits and rate restrictions</li>
              <li>Perform scheduled maintenance</li>
            </ul>

            <h2>8. Fees and Payments</h2>
            <p>
              Currently, our basic services are provided free of charge. We reserve the right to introduce paid tiers or change pricing in the future. Any changes will be communicated with reasonable notice.
            </p>

            <h2>9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, SMST shall not be liable for:
            </p>
            <ul>
              <li>Any indirect, incidental, or consequential damages</li>
              <li>Loss of profits, data, or business opportunities</li>
              <li>Errors in scheduled content or publication failures</li>
              <li>Actions or decisions made based on analytics provided</li>
            </ul>

            <h2>10. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless SMST, its operators, and affiliates from any claims, damages, or expenses arising from your use of our services or violation of these terms.
            </p>

            <h2>11. Intellectual Property</h2>
            <p>
              All content, designs, logos, and materials provided through SMST are the property of SMST or its licensors. You may not copy, modify, or distribute our intellectual property without permission.
            </p>

            <h2>12. Privacy</h2>
            <p>
              Your privacy is important to us. Please review our <a href="/privacy-policy" className="text-[var(--color-accent)] hover:underline">Privacy Policy</a> to understand how we collect, use, and protect your personal information.
            </p>

            <h2>13. Third-Party Links</h2>
            <p>
              Our services may contain links to third-party websites or services. We are not responsible for the content, privacy practices, or terms of these external sites.
            </p>

            <h2>14. Termination</h2>
            <p>
              We may terminate or suspend your access to our services at any time for:
            </p>
            <ul>
              <li>Violation of these terms</li>
              <li>Suspicious or fraudulent activity</li>
              <li>Extended period of inactivity</li>
              <li>Requests from law enforcement</li>
            </ul>

            <h2>15. Changes to Terms</h2>
            <p>
              We may update these Terms and Conditions from time to time. Continued use of our services after any changes constitutes acceptance of the new terms.
            </p>

            <h2>16. Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>

            <h2>17. Contact Information</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us:
            </p>
            <ul>
              <li>Email: argentjackjoshua@outlook.com</li>
              <li>Location: Surrey, United Kingdom</li>
            </ul>
          </div>
        </Card>
      </Container>
    </>
  );
}