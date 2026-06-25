'use client';

import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';

export default function TermsAndConditionsPage() {
  return (
    <>
      <PageHeader 
        title="Terms and Conditions" 
        description="The legal terms governing use of our services"
        align="left"
      />

      <Container>
        <Card className="p-8">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="text-sm text-text-text-muted mb-6">Last updated: June 4, 2026</p>

            <h2>1. Acceptance of Terms</h2>
            <p>
              Welcome to SMST (&quot;Social Media Scheduling Tool,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). By accessing or using our platform, website, and services (collectively, the &quot;Services&quot;), you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions (&quot;Terms&quot;). If you do not agree to these Terms, you must not access or use our Services.
            </p>
            <p>
              These Terms constitute a legally binding agreement between you and SMST. By using our Services, you represent that you are at least 18 years of age and have the legal capacity to enter into these Terms.
            </p>

            <h2>2. Description of Services</h2>
            <p>
              SMST provides a cloud-based social media management and scheduling platform that enables users to: Create, schedule, and publish content to multiple social media platforms; Connect and manage social media accounts through OAuth integration; Upload, store, and manage media files (videos, images, thumbnails); Access analytics and performance metrics from connected platforms; Organize content using campaigns, series, and templates; Manage content production workflows and pipelines; Track keywords and monitor content performance.
            </p>
            <p>
              Our Services integrate with third-party social media platforms including but not limited to TikTok, Facebook, Instagram, YouTube, and X (formerly Twitter).
            </p>

            <h2>3. Account Registration and Requirements</h2>
            <p>
              To access certain features of our Services, you must create an account. During registration, you agree to provide accurate, current, and complete information and to update such information to keep it accurate, current, and complete. You are solely responsible for: maintaining the confidentiality of your login credentials and password; restricting access to your account and computer or mobile device; all activities that occur under your account; notifying us immediately of any unauthorized use of your account. We reserve the right to terminate accounts that share login credentials or show signs of compromised security.
            </p>

            <h2>4. OAuth Connections and Platform Integration</h2>
            <p>
              Our Services allow you to connect your social media accounts through OAuth authentication. By connecting a platform account, you authorize SMST to access your platform account on your behalf, grant us permission to publish content, retrieve analytics, and perform other actions as permitted by the platform&apos;s API, and agree to the platform&apos;s terms of service and privacy policies. We store OAuth access tokens and refresh tokens securely using encryption. These tokens are used exclusively to publish scheduled content, retrieve performance analytics, and maintain platform connections. You may disconnect platform connections at any time through your account settings.
            </p>
            <p>
              You acknowledge that: we are not affiliated with, endorsed by, or agents of TikTok, Meta, YouTube, X, or any other social media platform; third-party platform services, APIs, and terms are subject to change without notice; we are not responsible for platform availability, API changes, or content moderation decisions made by these platforms.
            </p>

            <h2>5. User-Generated Content</h2>
            <p>
              You retain full ownership of all content you create, upload, and schedule through our Services (&quot;User Content&quot;). This includes text, captions, descriptions, hashtags, videos, images, thumbnails, and any other materials. By uploading or scheduling User Content, you grant us a limited, non-exclusive, revocable license to store, process, format, and transmit your content to connected platforms at scheduled times.
            </p>
            <p>
              You agree not to upload, schedule, or publish any content that: violates any applicable law, regulation, or court order; infringes on intellectual property rights of third parties; contains hate speech, harassment, or discriminatory content; depicts or promotes illegal activities; contains sexually explicit or pornographic material; promotes violence or dangerous activities; is false, misleading, or deceptive; contains malicious code or harmful software; spams or engages in artificial engagement practices.
            </p>

            <h2>6. Media Storage and Handling</h2>
            <p>
              Media files uploaded to our Services are stored using third-party cloud storage providers with security measures in place. We may impose restrictions on file formats, maximum file sizes, storage quotas, and video duration. You may delete your content and media files at any time. Upon account deletion, we will delete your content and media within 30 days, except where retention is required for legal compliance.
            </p>

            <h2>7. Acceptable Use Policy</h2>
            <p>
              You agree to use our Services only for lawful purposes. You shall not: violate any applicable law or regulation; infringe on intellectual property rights; attempt to gain unauthorized access to our systems; use automated tools that exceed reasonable rate limits; interfere with or disrupt our Services; reverse engineer or disassemble any part of our Services; harvest user information without consent; impersonate any person or entity; use our Services to spam or engage in fake engagement; upload content that could harm minors.
            </p>

            <h2>8. Service Availability and Modifications</h2>
            <p>
              We strive to provide reliable Services, but do not guarantee uninterrupted access. Service availability may be affected by maintenance, third-party issues, force majeure events, API changes, or cybersecurity threats. We reserve the right to modify features, change pricing, implement rate limits, update these Terms, and terminate accounts that violate these Terms.
            </p>

            <h2>9. Fees and Payment Terms</h2>
            <p>
              Some features are currently free. We reserve the right to introduce paid tiers or change pricing with reasonable notice. Should we introduce paid services, all fees will be clearly displayed before purchase. Due to the nature of digital services, we generally do not offer refunds for unused subscription periods.
            </p>

            <h2>10. Intellectual Property Rights</h2>
            <p>
              All content, designs, logos, trademarks, UI elements, software code, and documentation provided through our Services are the exclusive property of SMST or its licensors. You may not copy, modify, reproduce, or distribute any SMST intellectual property without prior written permission. Names and logos of third-party platforms are trademarks of their respective owners.
            </p>

            <h2>11. Third-Party Services and Links</h2>
            <p>
              Our Services integrate with third-party services subject to their respective terms and privacy policies. We are not responsible for external websites or resources linked from our platform.
            </p>

            <h2>12. Disclaimer of Warranties</h2>
            <p>
              OUR SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO: IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT SERVICES WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE, OR THAT ANALYTICS DATA WILL BE ACCURATE OR COMPLETE.
            </p>

            <h2>13. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, SMST SHALL NOT BE LIABLE FOR: ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES; LOSS OF PROFITS, REVENUE, DATA, OR BUSINESS OPPORTUNITIES; DAMAGES ARISING FROM PUBLICATION FAILURES, THIRD-PARTY PLATFORM ACTIONS, OR TECHNICAL FAILURES. IN NO EVENT SHALL OUR TOTAL LIABILITY EXCEED &pound;100 OR THE AMOUNT YOU HAVE PAID US IN THE PRECEDING 12 MONTHS.
            </p>

            <h2>14. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless SMST from any claims, damages, losses, costs, and expenses arising from: your use of our Services; your violation of these Terms; your violation of any law or rights of third parties; your User Content; any fraudulent or unlawful activity through your account.
            </p>

            <h2>15. Account Suspension and Termination</h2>
            <p>
              You may terminate your account at any time through your account settings. We may suspend or terminate accounts for: violation of these Terms; suspicious, fraudulent, or illegal activity; non-payment; extended inactivity; law enforcement requests; discontinuation of Services. Upon termination, your account and OAuth connections will be disabled, and your content will be deleted within 30 days.
            </p>

            <h2>16. Privacy and Data Protection</h2>
            <p>
              Our Services comply with UK GDPR, EU GDPR, and the Data Protection Act 2018. Please review our <a href="/privacy-policy" className="text-text-primary hover:underline">Privacy Policy</a> for detailed information about how we collect, use, and protect your personal data.
            </p>

            <h2>17. Governing Law and Jurisdiction</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales. For EEA users, this shall not affect mandatory consumer protection rights.
            </p>

            <h2>18. Dispute Resolution</h2>
            <p>
              Before initiating formal proceedings, you agree to contact us and attempt to resolve any dispute informally. For UK and EEA consumers, you may use the Online Dispute Resolution platform at <a href="https://ec.europa.eu/consumers/odr" className="text-text-primary hover:underline">https://ec.europa.eu/consumers/odr</a>.
            </p>

            <h2>19. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. Material changes will be communicated by posting the updated Terms with a new &quot;Last updated&quot; date and sending an email notification. Your continued use after changes constitutes acceptance of the updated Terms.
            </p>

            <h2>20. Severability</h2>
            <p>
              If any provision of these Terms is found invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect.
            </p>

            <h2>21. Entire Agreement</h2>
            <p>
              These Terms, together with our Privacy Policy and any other policies posted on our platform, constitute the entire agreement between you and SMST regarding your use of our Services.
            </p>

            <h2>22. Contact Information</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us:
            </p>
            <ul>
              <li><strong>Email:</strong> argentjackjoshua@outlook.com</li>
              <li><strong>Location:</strong> Surrey, United Kingdom</li>
            </ul>

            <h2>23. Force Majeure</h2>
            <p>
              SMST shall not be liable for any failure or delay in performing obligations where such failure results from causes beyond its reasonable control, including acts of God, natural disasters, war, terrorism, pandemics, or infrastructure failures.
            </p>
          </div>
        </Card>
      </Container>
    </>
  );
}