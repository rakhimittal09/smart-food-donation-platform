import React from 'react';
import { Shield, AlertTriangle } from 'lucide-react';

const PrivacyPolicyPage = () => {
  const sections = [
    {
      title: '1. Information We Collect',
      content: `We collect information you provide directly when registering or using our platform:
• **Personal Information**: Name, email address, phone number, address, city, state, and pincode.
• **Organization Details**: Organization name, registration number (for NGOs), service areas.
• **Donation Data**: Food item details, quantities, pickup/delivery addresses, photos, and food safety information.
• **Account Data**: Login credentials (passwords are stored in encrypted/hashed form and are never accessible in plaintext).
• **Usage Data**: IP addresses, browser type, pages visited, and interaction patterns for analytics.
• **Communication Data**: Messages exchanged through the platform, support requests, and feedback.`,
    },
    {
      title: '2. How We Use Your Information',
      content: `Your information is used to:
• Facilitate food donations, pickups, and deliveries between donors, NGOs, and volunteers.
• Match donors with nearby NGOs and food banks based on location, food type, and quantity.
• Send notifications about donation status, pickup schedules, and platform updates.
• Generate donation certificates and impact reports.
• Improve platform features, user experience, and service quality.
• Ensure food safety compliance and traceability.
• Communicate important updates, policy changes, and support responses.
• Prevent fraud, abuse, and ensure platform security.`,
    },
    {
      title: '3. Information Sharing & Disclosure',
      content: `We share your information only in these circumstances:
• **Between Platform Users**: Donor contact details are shared with matched NGOs/volunteers for pickup coordination. Anonymous donation mode hides donor identity from public listings.
• **Service Providers**: We may use third-party services for hosting, analytics, email delivery, and payment processing. These providers are bound by data protection agreements.
• **Legal Requirements**: We may disclose information when required by law, court order, or government request.
• **Safety**: When necessary to protect the safety of users, the public, or the integrity of the platform.
• We do **not** sell, rent, or trade your personal information to third parties for marketing purposes.`,
    },
    {
      title: '4. Data Security',
      content: `We implement industry-standard security measures:
• Passwords are hashed using bcrypt with salt rounds before storage.
• All API communications use JWT (JSON Web Token) authentication.
• HTTPS encryption for data in transit.
• Regular security audits and vulnerability assessments.
• Role-based access control (RBAC) to limit data access to authorized users only.
• Automated session expiration and token invalidation.
However, no method of electronic storage or transmission is 100% secure. We cannot guarantee absolute security.`,
    },
    {
      title: '5. Cookies & Tracking',
      content: `We use:
• **Essential Cookies**: Session management and authentication tokens stored in localStorage.
• **Analytics**: We may use analytics tools to understand platform usage patterns and improve our services.
• We do not use third-party advertising cookies or trackers.
• You can clear cookies and local storage through your browser settings at any time.`,
    },
    {
      title: '6. Your Rights',
      content: `You have the right to:
• **Access**: Request a copy of your personal data stored on our platform.
• **Correction**: Update or correct inaccurate personal information through your profile settings.
• **Deletion**: Request deletion of your account and associated data by contacting support.
• **Restriction**: Request that we limit how we process your data.
• **Data Portability**: Request your data in a machine-readable format.
• **Withdraw Consent**: Opt out of non-essential communications at any time.
To exercise these rights, contact us at support@nourishlink.org.`,
    },
    {
      title: '7. Data Retention',
      content: `• Active account data is retained as long as your account is active.
• Donation records and certificates are retained for a minimum of 3 years for audit and impact reporting purposes.
• Deleted accounts have their personal data removed within 30 days, except where retention is required by law.
• Activity logs are retained for 12 months for security and debugging purposes.
• Anonymous donation data (without personal identifiers) may be retained indefinitely for aggregate statistics.`,
    },
    {
      title: '8. Children\'s Privacy',
      content: `Our platform is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from minors. If you believe a minor has provided us with personal data, please contact us immediately for removal.`,
    },
    {
      title: '9. Changes to This Policy',
      content: `We may update this Privacy Policy from time to time. Significant changes will be communicated through:
• In-platform notifications.
• Email to registered users.
• A prominent notice on this page with the updated effective date.
Continued use of the platform after changes constitutes acceptance of the revised policy.`,
    },
    {
      title: '10. Contact Information',
      content: `For privacy-related inquiries or to exercise your data rights:
• **Email**: support@nourishlink.org
• **Phone**: +91 98765 43210
• **Address**: Green Park Avenue, New Delhi — 110016, India
• **Response Time**: We aim to respond to all privacy requests within 7 business days.`,
    },
  ];

  return (
    <div>
      <section style={{
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        color: '#ffffff', padding: '4rem 1.5rem', textAlign: 'center',
      }}>
        <Shield size={36} style={{ color: 'var(--primary-400)', marginBottom: '1rem' }} />
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>Privacy Policy</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Last updated: August 2026</p>
      </section>

      <section style={{ padding: '3rem 1.5rem', background: 'var(--bg-main)' }}>
        <div className="container" style={{ maxWidth: '820px' }}>
          {/* Legal Disclaimer */}
          <div style={{
            background: 'var(--amber-50)', border: '1px solid var(--amber-500)',
            borderRadius: 'var(--radius-md)', padding: '1.25rem 1.5rem',
            marginBottom: '2.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start',
          }}>
            <AlertTriangle size={22} style={{ color: 'var(--amber-600)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--amber-800)', marginBottom: '0.25rem' }}>Legal Review Required</div>
              <p style={{ fontSize: '0.875rem', color: 'var(--amber-800)', lineHeight: 1.6 }}>
                This privacy policy is a template for demonstration purposes. It must be reviewed, customized, and approved by a qualified legal professional before being used in a production environment. Laws and regulations vary by jurisdiction.
              </p>
            </div>
          </div>

          <div className="card" style={{ padding: '2.5rem' }}>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
              NourishLink ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, share, and safeguard your personal information when you use our Smart Food Donation Platform.
            </p>

            {sections.map((section, i) => (
              <div key={i} style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
                  {section.title}
                </h2>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                  {section.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;
