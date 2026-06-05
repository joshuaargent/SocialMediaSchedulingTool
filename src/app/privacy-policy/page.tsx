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
            <p className="text-sm text-[var(--color-text-muted)] mb-6">Last updated: June 4, 2026</p>

            <h2>1. Introduction</h2>
            <p>
              SMST ("Social Media Scheduling Tool," "we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our social media scheduling and management platform. Please read this policy carefully. If you do not agree with its terms, please do not use our services.
            </p>
            <p>
              This Privacy Policy applies to all users of our platform located in the United Kingdom and the European Economic Area ("EEA"), and complies with the UK General Data Protection Regulation ("UK GDPR"), the EU General Data Protection Regulation ("GDPR"), and the Data Protection Act 2018.
            </p>

            <h2>2. Data Controller</h2>
            <p>
              The data controller responsible for your personal information is:
            </p>
            <ul>
              <li><strong>Business Name:</strong> SMST (Social Media Scheduling Tool)</li>
              <li><strong>Contact:</strong> argentjackjoshua@outlook.com</li>
              <li><strong>Location:</strong> Surrey, United Kingdom</li>
            </ul>

            <h2>3. Information We Collect</h2>
            
            <h3>3.1 Information You Provide Directly</h3>
            <p>We collect information you voluntarily provide when creating an account, using our services, or communicating with us:</p>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, profile picture, organization name, and other contact details</li>
              <li><strong>Payment Information:</strong> If applicable, billing address and payment method details (processed securely through third-party payment providers)</li>
              <li><strong>Communications:</strong> Messages, feedback, and correspondence you send to us</li>
            </ul>

            <h3>3.2 Content and Media</h3>
            <p>To provide our core scheduling services, we collect and process:</p>
            <ul>
              <li><strong>User-Generated Content:</strong> Text, captions, descriptions, hashtags, and metadata for scheduled posts</li>
              <li><strong>Media Files:</strong> Videos, images, thumbnails, and other media assets you upload for scheduling and publishing</li>
              <li><strong>Scheduling Data:</strong> Scheduled publication dates, times, platforms, and related configurations</li>
              <li><strong>Content Templates:</strong> Saved templates and preset content configurations</li>
            </ul>
            <p><strong>Important:</strong> Media files are stored securely and processed only for the purpose of scheduled publishing to your connected social media platforms. Content is deleted upon your request or account deletion unless required for legal compliance.</p>

            <h3>3.3 OAuth and Platform Connection Data</h3>
            <p>When you connect your social media accounts (TikTok, Facebook, Instagram, YouTube, etc.), we receive and store:</p>
            <ul>
              <li><strong>Access Tokens:</strong> OAuth tokens that authorize us to publish content on your behalf</li>
              <li><strong>Refresh Tokens:</strong> Tokens used to maintain platform connections</li>
              <li><strong>Platform Identifiers:</strong> Your account IDs and display names on connected platforms</li>
              <li><strong>Profile Information:</strong> Profile images, follower counts, and public profile data</li>
              <li><strong>Analytics Data:</strong> Performance metrics, engagement data, and insights from your connected platforms</li>
            </ul>
            <p>These tokens are stored encrypted and are only used to fulfill scheduled publishing operations and retrieve analytics at your request.</p>

            <h3>3.4 Automatically Collected Information</h3>
            <p>When you use our platform, we automatically collect:</p>
            <ul>
              <li><strong>Usage Data:</strong> Features accessed, posts created, scheduling patterns, and session duration</li>
              <li><strong>Device Information:</strong> Browser type, operating system, device identifiers, and IP address</li>
              <li><strong>Log Data:</strong> Access times, referring URLs, error logs, and performance metrics</li>
              <li><strong>Cookie Data:</strong> As described in Section 10 below</li>
            </ul>

            <h2>4. How We Use Your Information</h2>
            <p>We use your information for the following purposes:</p>
            <ul>
              <li><strong>Service Provision:</strong> To provide, maintain, and improve our social media scheduling platform</li>
              <li><strong>Content Publishing:</strong> To schedule and publish your content to connected social media platforms at requested times</li>
              <li><strong>Authentication:</strong> To verify your identity and manage your account</li>
              <li><strong>Analytics:</strong> To generate performance reports and insights about your content</li>
              <li><strong>Communication:</strong> To send service-related notifications, updates, and support responses</li>
              <li><strong>Security:</strong> To detect, prevent, and respond to fraud, abuse, or security threats</li>
              <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal requests</li>
            </ul>

            <h2>5. Legal Basis for Processing (GDPR)</h2>
            <p>If you are located in the UK or EEA, we process your personal data under the following legal bases:</p>
            <ul>
              <li><strong>Contract Performance (Article 6(1)(b)):</strong> Processing necessary to provide our services to you</li>
              <li><strong>Consent (Article 6(1)(a)):</strong> Where you have given explicit consent for specific processing activities</li>
              <li><strong>Legitimate Interests (Article 6(1)(f)):</strong> Where processing serves our legitimate business interests (security, fraud prevention) without overriding your rights</li>
              <li><strong>Legal Obligation (Article 6(1)(c)):</strong> Where processing is required by applicable law</li>
            </ul>

            <h2>6. Information Sharing and Disclosure</h2>
            
            <h3>6.1 Platform Sharing</h3>
            <p>Your content is shared with the social media platforms you select for publishing. This includes:</p>
            <ul>
              <li>Post content, captions, and metadata</li>
              <li>Media files (videos, images)</li>
              <li>Scheduling and publishing requests</li>
            </ul>
            <p>Once shared with third-party platforms, their privacy policies govern how your data is used.</p>

            <h3>6.2 Service Providers</h3>
            <p>We share information with trusted third-party service providers who assist us in operating our platform:</p>
            <ul>
              <li><strong>Cloud Infrastructure:</strong> Vercel (hosting), providing secure cloud services</li>
              <li><strong>Database Services:</strong> Prisma (database ORM) and PostgreSQL (database hosting)</li>
              <li><strong>Authentication:</strong> NextAuth.js for secure authentication</li>
              <li><strong>Analytics:</strong> Platform analytics APIs (YouTube Data API, TikTok API, etc.)</li>
              <li><strong>Payment Processors:</strong> If applicable, for processing payments securely</li>
            </ul>
            <p>These providers are bound by appropriate data processing agreements.</p>

            <h3>6.3 Legal Requirements</h3>
            <p>We may disclose your information if required by law, court order, or governmental regulation, or if we believe disclosure is necessary to:</p>
            <ul>
              <li>Comply with legal obligations</li>
              <li>Protect our rights, privacy, safety, or property</li>
              <li>Prevent fraud or illegal activity</li>
              <li>Respond to valid requests from law enforcement</li>
            </ul>

            <h3>6.4 Business Transfers</h3>
            <p>If SMST undergoes a merger, acquisition, sale of assets, or insolvency proceedings, your information may be transferred as part of that transaction.</p>

            <h3>6.5 We Do Not Sell Your Data</h3>
            <p>We do not sell, trade, or rent your personal information to third parties for marketing purposes.</p>

            <h2>7. International Data Transfers</h2>
            <p>
              SMST is operated from the United Kingdom. Your information may be transferred to and processed in countries outside the UK or EEA, including countries that may have different data protection laws.
            </p>
            <p>
              When we transfer data internationally, we ensure appropriate safeguards are in place, such as:
            </p>
            <ul>
              <li>Standard Contractual Clauses (SCCs) approved by the UK ICO or European Commission</li>
              <li>Transfers to countries with adequate data protection decisions</li>
              <li>Binding Corporate Rules where applicable</li>
            </ul>

            <h2>8. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information:
            </p>
            <ul>
              <li>Encryption of data in transit using TLS/SSL</li>
              <li>Encryption of sensitive data at rest</li>
              <li>Regular security assessments and penetration testing</li>
              <li>Access controls and authentication requirements</li>
              <li>Employee data protection training</li>
              <li>Incident response procedures</li>
            </ul>
            <p>
              While we strive to protect your information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.
            </p>

            <h2>9. Data Retention</h2>
            <p>We retain your information for the following periods:</p>
            <ul>
              <li><strong>Account Data:</strong> Retained while your account is active and for 2 years after account deletion</li>
              <li><strong>Content and Media:</strong> Deleted within 30 days of account deletion or content removal request</li>
              <li><strong>OAuth Tokens:</strong> Retained until you disconnect the platform or delete your account</li>
              <li><strong>Usage Logs:</strong> Retained for 1 year for security and debugging purposes</li>
              <li><strong>Financial Records:</strong> Retained for 7 years as required by tax and accounting regulations</li>
              <li><strong>Legal Compliance:</strong> Retained as long as necessary to comply with legal obligations</li>
            </ul>

            <h2>10. Cookies and Tracking Technologies</h2>
            
            <h3>10.1 Essential Cookies</h3>
            <p>These cookies are necessary for the platform to function:</p>
            <ul>
              <li>Authentication and session management</li>
              <li>Security features (CSRF protection)</li>
              <li>Load balancing</li>
            </ul>

            <h3>10.2 Functional Cookies</h3>
            <p>These cookies enhance your experience:</p>
            <ul>
              <li>Remembering your preferences and settings</li>
              <li>Language preferences</li>
              <li>UI customization options</li>
            </ul>

            <h3>10.3 Analytics and Website Performance</h3>
            <p>We use Vercel Web Analytics to collect anonymous, aggregated statistics about page views, device types, browsers, and geographic location. This service:</p>
            <ul>
              <li>Does not set or read browser cookies</li>
              <li>Uses a transient server-side hash that is discarded after 24 hours</li>
              <li>Does not collect personal information or track individuals across sessions</li>
              <li>Cannot be used to reconstruct browsing activity or identify users</li>
            </ul>
            <p>
              Under the UK Data Use and Access Act 2025, this analytics service qualifies for the statistical-purpose exemption as it does not store identifiers on your device and collects only aggregate, non-personal data. You may opt out of this analytics by contacting us at <a href="mailto:argentjackjoshua@outlook.com" className="text-[var(--color-accent)] hover:underline">argentjackjoshua@outlook.com</a> or by enabling &quot;Do Not Track&quot; in your browser settings.
            </p>

            <h2>11. Your Rights Under GDPR/UK GDPR</h2>
            <p>If you are located in the UK or EEA, you have the following rights:</p>
            <ul>
              <li><strong>Right of Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
              <li><strong>Right to Restrict Processing:</strong> Request limitation of processing in certain circumstances</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
              <li><strong>Right to Object:</strong> Object to processing based on legitimate interests or for direct marketing</li>
              <li><strong>Rights Related to Automated Decision-Making:</strong> Not be subject to decisions based solely on automated processing that significantly affect you</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
              <li><strong>Right to Lodge a Complaint:</strong> File a complaint with the Information Commissioner's Office (ICO) if you believe your rights have been violated</li>
            </ul>
            <p>To exercise any of these rights, contact us at argentjackjoshua@outlook.com.</p>

            <h2>12. Children's Privacy</h2>
            <p>
              Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected personal information from a child without verified parental consent, we will take steps to delete that information promptly.
            </p>
            <p>
              In accordance with the UK Age Appropriate Design Code, we implement age-appropriate safeguards for our platform.
            </p>

            <h2>13. Automated Decision-Making</h2>
            <p>
              We do not make decisions about you based solely on automated processing (including profiling) that would produce legal effects or similarly significant affects you, except where:
            </p>
            <ul>
              <li>Necessary for entering into or performing a contract with you</li>
              <li>Authorized by applicable law</li>
              <li>Based on your explicit consent</li>
            </ul>

            <h2>14. Data Breach Notification</h2>
            <p>
              In accordance with UK GDPR and GDPR requirements:
            </p>
            <ul>
              <li>We will notify the ICO of reportable data breaches within 72 hours of becoming aware</li>
              <li>If the breach is likely to result in high risk to your rights and freedoms, we will notify affected users directly</li>
              <li>Notifications will describe the nature of the breach, likely consequences, and measures taken or proposed</li>
            </ul>

            <h2>15. Third-Party Platform Disclaimers</h2>
            <p>
              Our platform integrates with third-party social media platforms (TikTok, Facebook, Instagram, YouTube, etc.). We are not responsible for:
            </p>
            <ul>
              <li>The privacy practices of these platforms</li>
              <li>How they collect, use, or protect your data</li>
              <li>Changes to their APIs or services that may affect our platform</li>
              <li>Content moderation decisions made by these platforms</li>
            </ul>
            <p>
              Your use of connected platforms is subject to their respective privacy policies and terms of service.
            </p>

            <h2>16. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes by:
            </p>
            <ul>
              <li>Posting the updated policy on this page</li>
              <li>Updating the "Last updated" date</li>
              <li>Sending an email notification for significant changes</li>
              <li>Providing prominent notice through our platform</li>
            </ul>
            <p>
              Your continued use of our services after changes take effect constitutes acceptance of the updated policy.
            </p>

            <h2>17. Contact Us</h2>
            <p>
              If you have any questions, requests, or concerns about this Privacy Policy or our data practices, please contact us:
            </p>
            <ul>
              <li><strong>Email:</strong> argentjackjoshua@outlook.com</li>
              <li><strong>Location:</strong> Surrey, United Kingdom</li>
            </ul>
            <p>
              For data protection inquiries, we aim to respond within 30 days. You also have the right to lodge a complaint with the Information Commissioner's Office (ICO) at <a href="https://ico.org.uk" className="text-[var(--color-accent)] hover:underline">https://ico.org.uk</a>.
            </p>

            <h2>18. UK Specific Provisions</h2>
            <p>
              This Privacy Policy complies with:
            </p>
            <ul>
              <li>UK General Data Protection Regulation (UK GDPR)</li>
              <li>Data Protection Act 2018</li>
              <li>Privacy and Electronic Communications Regulations (PECR)</li>
              <li>Age Appropriate Design Code</li>
            </ul>
          </div>
        </Card>
      </Container>
    </>
  );
}