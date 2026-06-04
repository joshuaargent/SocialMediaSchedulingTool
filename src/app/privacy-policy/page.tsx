'use client';

import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHeader 
        title="Privacy Policy" 
        description="How we collect, use, and protect your data"
        align="left"
      />

      <Container>
        <Card className="p-8">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="text-sm text-[var(--color-text-muted)] mb-6">Last updated: January 1, 2026</p>

            <h2>1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us, including:
            </p>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, and other contact details when you create an account</li>
              <li><strong>Social Media Data:</strong> Content you schedule, analytics data from connected platforms, and engagement metrics</li>
              <li><strong>Usage Data:</strong> Information about how you interact with our services, including features used and time spent</li>
              <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Schedule and publish content to your connected social media platforms</li>
              <li>Analyze content performance and generate analytics reports</li>
              <li>Communicate with you about service updates and support</li>
              <li>Protect against fraud and ensure platform security</li>
            </ul>

            <h2>3. Information Sharing</h2>
            <p>
              We do not sell, trade, or otherwise transfer your personal information to third parties. We may share information:
            </p>
            <ul>
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights, privacy, safety, or property</li>
              <li>In connection with a merger, acquisition, or sale of assets</li>
            </ul>

            <h2>4. OAuth Connections</h2>
            <p>
              When you connect your social media accounts through OAuth, we access only the information necessary to provide our scheduling services. We store access tokens securely and never share them with third parties. You can disconnect your accounts at any time through the Settings page.
            </p>

            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
            </p>

            <h2>6. Data Retention</h2>
            <p>
              We retain your information for as long as your account is active or as needed to provide services. You may request deletion of your data at any time by contacting us at argentjackjoshua@outlook.com.
            </p>

            <h2>7. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to:
            </p>
            <ul>
              <li>Keep you logged in to your account</li>
              <li>Remember your preferences and settings</li>
              <li>Understand how you use our services</li>
              <li>Improve user experience</li>
            </ul>

            <h2>8. Your Rights</h2>
            <p>
              Depending on your location, you may have the right to:
            </p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Data portability</li>
            </ul>

            <h2>9. Children&apos;s Privacy</h2>
            <p>
              Our services are not directed to individuals under 18 years of age. We do not knowingly collect personal information from children.
            </p>

            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
            </p>

            <h2>11. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us:
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