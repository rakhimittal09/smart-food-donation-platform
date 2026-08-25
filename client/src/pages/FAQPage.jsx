import React, { useState } from 'react';
import { HelpCircle, Search, ChevronDown, ChevronUp, MessageSquare, Mail, Phone } from 'lucide-react';

const FAQPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState(null);

  const faqCategories = [
    {
      category: 'Getting Started',
      icon: '🚀',
      items: [
        {
          q: 'How do I register on NourishLink?',
          a: 'Click "Register" in the navigation bar. Choose your role (Donor, NGO/Receiver, or Volunteer), fill in your details, and create your account. You can start using the platform immediately after registration.',
        },
        {
          q: 'What roles are available on the platform?',
          a: 'NourishLink supports four roles: Donor (individuals or organizations donating surplus food), NGO/Receiver (organizations collecting food for distribution), Volunteer/Pickup Partner (individuals helping with food pickup and delivery), and Admin (platform administrators).',
        },
        {
          q: 'Is there a cost to use NourishLink?',
          a: 'No, NourishLink is completely free for all users. Our mission is to reduce food waste and fight hunger, so there are no charges for listing donations, requesting food, or volunteering.',
        },
        {
          q: 'Can I use the platform anonymously?',
          a: 'Yes! When creating a donation, you can enable the "Anonymous Donation" option. Your identity will be hidden from public listings and recipients, though our team retains your information for safety and logistics purposes.',
        },
      ],
    },
    {
      category: 'Donations',
      icon: '🍚',
      items: [
        {
          q: 'What types of food can I donate?',
          a: 'You can donate: Cooked Food, Wheat/Flour, Rice & Grains, Pulses, Fruits & Vegetables, Packaged/Grocery Items, Bakery Items, and Other food items. Each donation can include multiple items with different quantities and units.',
        },
        {
          q: 'What quantity units are supported?',
          a: 'You can specify quantities in: kilograms (kg), grams, litres, packets, bags, pieces, meals, boxes, or servings — whatever best describes your donation.',
        },
        {
          q: 'Can I donate multiple items in one listing?',
          a: 'Yes! The donation form allows you to add multiple food items in a single donation. Each item can have its own category, quantity, and unit. For example, you can donate 10 kg wheat + 5 kg rice + 2 litres cooking oil in one listing.',
        },
        {
          q: 'How do I set up recurring donations?',
          a: 'When creating a donation, toggle the "Recurring Donation" option and select your preferred frequency (daily, weekly, bi-weekly, or monthly). The platform will remind you to renew your listing at each interval.',
        },
        {
          q: 'Can I edit or cancel a donation after listing?',
          a: 'Yes, you can edit or cancel donations that haven\'t been picked up yet. Go to your Donor Dashboard, find the donation, and click Edit or Cancel. Once a donation is picked up or delivered, it cannot be modified.',
        },
        {
          q: 'What is a Donation ID?',
          a: 'Every donation receives a unique Donation ID (e.g., DON-20260824-ABCD) for tracking. You can use this ID to track your donation status, share it with NGOs, and reference it on your donation certificate.',
        },
      ],
    },
    {
      category: 'Pickup & Delivery',
      icon: '🚚',
      items: [
        {
          q: 'What donation methods are available?',
          a: 'You can choose from: NGO/Volunteer Pickup (an NGO or volunteer comes to collect), Self-Delivery (you deliver the food yourself), Arrange Pickup (request a pickup partner), Choose Nearby NGO (select a specific NGO from our network), or Need Help Deciding (our system will recommend the best option).',
        },
        {
          q: 'How does the NGO matching work?',
          a: 'Our smart matching system considers your location (city/pincode), food category, quantity, and NGO preferences to suggest the best-matched NGOs in your area. Matches are scored based on proximity, food type compatibility, and organization capacity.',
        },
        {
          q: 'Can I choose a specific time for pickup?',
          a: 'Yes, you specify a pickup date and time slot when creating your donation. NGOs and volunteers will coordinate within your specified window.',
        },
        {
          q: 'How do I track my donation\'s pickup status?',
          a: 'Each donation goes through a status lifecycle: Available → Pending → Accepted → Picked Up → Delivered. You can track the real-time status from your Donor Dashboard or the Donation Details page. You\'ll also receive notifications at each stage.',
        },
      ],
    },
    {
      category: 'Food Safety',
      icon: '🛡️',
      items: [
        {
          q: 'What food safety information should I provide?',
          a: 'We encourage you to specify: storage type (room temperature, refrigerated, frozen, hot), whether temperature control is maintained, any allergens present, and relevant food safety certifications. This helps NGOs handle your donation safely.',
        },
        {
          q: 'What about expiry dates?',
          a: 'Every donation requires an expiry date. The platform automatically filters out expired listings and warns receivers about donations nearing expiry. We recommend setting realistic expiry dates based on food type and storage conditions.',
        },
        {
          q: 'Is donated food inspected?',
          a: 'NourishLink is a technology platform that connects donors and receivers. We do not inspect food directly. Receivers are encouraged to verify food quality upon collection. Donors must ensure food is safe for consumption at the time of listing.',
        },
      ],
    },
    {
      category: 'Account & Privacy',
      icon: '🔒',
      items: [
        {
          q: 'How do I update my profile?',
          a: 'Go to your Profile page from the user menu. You can update your name, phone, address, organization details, and avatar. Volunteers can update service areas and vehicle details; NGOs can update registration number and food type preferences.',
        },
        {
          q: 'How do I change my password?',
          a: 'Go to your Profile page and use the "Change Password" section. You\'ll need to enter your current password and your new password.',
        },
        {
          q: 'Is my personal data secure?',
          a: 'Yes. Passwords are hashed with bcrypt, API communication uses JWT tokens, and we implement role-based access control. Read our full Privacy Policy for detailed information on data handling and security measures.',
        },
        {
          q: 'Can I delete my account?',
          a: 'Yes, contact support at support@nourishlink.org to request account deletion. Your personal data will be removed within 30 days, though anonymized donation records may be retained for impact reporting.',
        },
      ],
    },
    {
      category: 'NGO Partners',
      icon: '🤝',
      items: [
        {
          q: 'How do I register as an NGO?',
          a: 'Choose "NGO / Food Receiver" during registration. Provide your organization name, registration number, areas served, and types of food you accept. This helps our matching algorithm connect you with relevant donations.',
        },
        {
          q: 'How do I request food from a donation?',
          a: 'Browse available donations, select one, and click "Request Food". Specify the quantity you need and provide a message about your distribution plan. The donor will review and approve your request.',
        },
        {
          q: 'Can I get a donation certificate?',
          a: 'Yes! Once a donation is marked as "Delivered", both donors and receivers can download a donation certificate/receipt from the Donation Details page. This can be used for tax purposes and impact reporting.',
        },
        {
          q: 'How do I find nearby donations?',
          a: 'The Donations page shows available food in your area. Use the search and filter options to find donations by category, food type, location, and quantity. Your Receiver Dashboard also highlights urgent donations expiring soon.',
        },
      ],
    },
  ];

  // Flatten for search
  const allFaqs = faqCategories.flatMap((cat) =>
    cat.items.map((item) => ({ ...item, category: cat.category, icon: cat.icon }))
  );

  const filteredFaqs = searchTerm
    ? allFaqs.filter(
        (f) =>
          f.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.a.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : null;

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        color: '#ffffff', padding: '4rem 1.5rem', textAlign: 'center',
      }}>
        <HelpCircle size={36} style={{ color: 'var(--primary-400)', marginBottom: '1rem' }} />
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>Frequently Asked Questions</h1>
        <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
          Find answers to common questions about using NourishLink
        </p>

        {/* Search */}
        <div style={{ maxWidth: '500px', margin: '0 auto', position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setOpenIndex(null); }}
            placeholder="Search for a question..."
            style={{
              width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem',
              borderRadius: 'var(--radius-md)', border: '1px solid #334155',
              background: '#1e293b', color: '#ffffff', fontSize: '0.95rem',
              outline: 'none',
            }}
          />
        </div>
      </section>

      <section style={{ padding: '3rem 1.5rem', background: 'var(--bg-main)' }}>
        <div className="container" style={{ maxWidth: '820px' }}>
          
          {/* Search Results */}
          {filteredFaqs && (
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                {filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''} for "{searchTerm}"
              </p>
              {filteredFaqs.length > 0 ? (
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                  {filteredFaqs.map((faq, i) => (
                    <div key={i}>
                      <button
                        onClick={() => toggleAccordion(i)}
                        style={{
                          width: '100%', padding: '1.25rem 1.5rem',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          background: 'none', border: 'none', cursor: 'pointer',
                          borderBottom: '1px solid var(--border-color)', textAlign: 'left',
                        }}
                      >
                        <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)', paddingRight: '1rem' }}>
                          {faq.icon} {faq.q}
                        </span>
                        {openIndex === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                      {openIndex === i && (
                        <div style={{ padding: '1rem 1.5rem 1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7, background: 'var(--bg-main)' }}>
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No matching questions found. Try a different search term or contact support below.
                </div>
              )}
            </div>
          )}

          {/* Category Sections */}
          {!filteredFaqs && faqCategories.map((cat, ci) => (
            <div key={ci} style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>{cat.icon}</span> {cat.category}
              </h2>
              <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                {cat.items.map((faq, fi) => {
                  const globalIndex = ci * 100 + fi;
                  return (
                    <div key={fi}>
                      <button
                        onClick={() => toggleAccordion(globalIndex)}
                        style={{
                          width: '100%', padding: '1.1rem 1.5rem',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          background: openIndex === globalIndex ? 'var(--primary-50)' : 'none',
                          border: 'none', cursor: 'pointer',
                          borderBottom: '1px solid var(--border-color)', textAlign: 'left',
                          transition: 'background 150ms ease',
                        }}
                      >
                        <span style={{ fontWeight: 600, fontSize: '0.925rem', color: 'var(--text-main)', paddingRight: '1rem' }}>
                          {faq.q}
                        </span>
                        {openIndex === globalIndex
                          ? <ChevronUp size={18} style={{ color: 'var(--primary-600)', flexShrink: 0 }} />
                          : <ChevronDown size={18} style={{ color: 'var(--text-light)', flexShrink: 0 }} />
                        }
                      </button>
                      {openIndex === globalIndex && (
                        <div style={{
                          padding: '1rem 1.5rem 1.5rem', fontSize: '0.9rem',
                          color: 'var(--text-muted)', lineHeight: 1.75, background: '#ffffff',
                          borderBottom: '1px solid var(--border-color)',
                          animation: 'fadeIn 200ms ease',
                        }}>
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Help Contact */}
          <div className="card" style={{
            padding: '2rem', textAlign: 'center', marginTop: '2rem',
            background: 'linear-gradient(135deg, #ecfdf5, #ffffff)',
            border: '1px solid var(--primary-200)',
          }}>
            <MessageSquare size={28} style={{ color: 'var(--primary-600)', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Still Have Questions?</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Our support team is happy to help you with any questions or issues.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="mailto:support@nourishlink.org" className="btn btn-primary" style={{ gap: '0.5rem' }}>
                <Mail size={16} /> Email Support
              </a>
              <a href="tel:+919876543210" className="btn btn-secondary" style={{ gap: '0.5rem' }}>
                <Phone size={16} /> +91 98765 43210
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQPage;
