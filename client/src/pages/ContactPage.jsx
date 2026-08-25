import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactInfo = [
    { icon: Mail, title: 'Email Us', value: 'support@nourishlink.org', sub: 'We respond within 24 hours' },
    { icon: Phone, title: 'Call Us', value: '+91 98765 43210', sub: 'Mon–Sat, 9 AM – 6 PM IST' },
    { icon: MapPin, title: 'Visit Us', value: 'Green Park Avenue', sub: 'New Delhi — 110016, India' },
    { icon: Clock, title: 'Office Hours', value: 'Mon – Sat', sub: '9:00 AM – 6:00 PM IST' },
  ];

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff',
        padding: '4rem 1.5rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <MessageSquare size={36} style={{ color: 'var(--primary-400)', marginBottom: '1rem' }} />
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>Contact Us</h1>
          <p style={{ fontSize: '1rem', color: '#94a3b8', lineHeight: 1.65 }}>
            Have questions, suggestions, or want to partner with us? We'd love to hear from you.
          </p>
        </div>
      </section>

      <section style={{ padding: '3rem 1.5rem', background: 'var(--bg-main)' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
            
            {/* Contact Form */}
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.5rem' }}>Send a Message</h2>

              {submitted && (
                <div style={{
                  background: 'var(--primary-50)', color: 'var(--primary-800)',
                  border: '1px solid var(--primary-200)', borderRadius: 'var(--radius-md)',
                  padding: '1rem', fontSize: '0.9rem', marginBottom: '1.5rem',
                }}>
                  ✅ Thank you! Your message has been sent. We'll get back to you within 24 hours.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Your Name *</label>
                    <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} placeholder="John Doe" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} placeholder="name@email.com" required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <input type="text" name="subject" className="form-input" value={formData.subject} onChange={handleChange} placeholder="How can we help?" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea name="message" className="form-textarea" rows="5" value={formData.message} onChange={handleChange} placeholder="Tell us more about your inquiry..." required />
                </div>
                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', gap: '0.5rem' }}>
                  <Send size={18} /> Send Message
                </button>
              </form>
            </div>

            {/* Contact Info Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {contactInfo.map((info, i) => (
                <div key={i} className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '14px',
                    background: 'var(--primary-50)', color: 'var(--primary-600)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <info.icon size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{info.title}</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>{info.value}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{info.sub}</div>
                  </div>
                </div>
              ))}

              {/* Map Placeholder */}
              <div className="card" style={{
                padding: '0', overflow: 'hidden', flex: 1, minHeight: '200px',
                background: 'linear-gradient(135deg, #f0fdf4, #e0f2fe)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  <MapPin size={32} style={{ color: 'var(--primary-500)', marginBottom: '0.5rem' }} />
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Green Park Avenue, New Delhi</div>
                  <div style={{ fontSize: '0.8rem' }}>India — 110016</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
