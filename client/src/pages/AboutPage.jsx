import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, Users, Target, Shield, Globe, TrendingUp, Truck, Utensils } from 'lucide-react';

const AboutPage = () => {
  const stats = [
    { icon: Utensils, value: '50,000+', label: 'Meals Rescued', color: 'var(--primary-600)' },
    { icon: Users, value: '1,200+', label: 'Active Donors', color: 'var(--sky-600)' },
    { icon: Globe, value: '12+', label: 'Cities Connected', color: 'var(--amber-600)' },
    { icon: Truck, value: '500+', label: 'NGO Partners', color: 'var(--indigo-600)' },
  ];

  const howItWorks = [
    { step: '01', title: 'List Your Surplus', desc: 'Donors list surplus food with details — category, quantity, pickup time, and food safety info.' },
    { step: '02', title: 'Smart Matching', desc: 'Our platform matches donations with nearby NGOs and food banks based on location, food type, and quantity.' },
    { step: '03', title: 'Pickup & Delivery', desc: 'Choose your preferred method — NGO pickup, self-delivery, or volunteer-assisted pickup.' },
    { step: '04', title: 'Feed Communities', desc: 'Food reaches families in need. Track every donation from listing to delivery with real-time status updates.' },
  ];

  const values = [
    { icon: Target, title: 'Zero Hunger Mission', desc: 'Aligned with UN SDG Goal 2, we strive to end hunger by connecting surplus food with those who need it most.' },
    { icon: Shield, title: 'Food Safety First', desc: 'Every donation includes safety details — storage type, temperature control, allergens — ensuring safe food reaches communities.' },
    { icon: TrendingUp, title: 'Measurable Impact', desc: 'Track your contributions with real-time impact metrics, certificates, and environmental savings reports.' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #10b981 100%)',
        color: '#ffffff',
        padding: '5rem 1.5rem 4rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '20px',
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1.5rem',
          }}>
            <HeartHandshake size={36} />
          </div>
          <h1 style={{ fontSize: '2.75rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '1rem' }}>
            Transforming Surplus Meals<br />Into Sustenance for All
          </h1>
          <p style={{ fontSize: '1.15rem', opacity: 0.9, lineHeight: 1.7, maxWidth: '600px', margin: '0 auto 2rem' }}>
            NourishLink is a smart food donation platform that connects donors, NGOs, and volunteers
            to reduce food waste and fight hunger through technology-driven logistics.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-lg" style={{ background: '#ffffff', color: 'var(--primary-800)', fontWeight: 700 }}>
              Join the Mission
            </Link>
            <Link to="/donations" className="btn btn-lg btn-outline" style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#ffffff' }}>
              Browse Donations
            </Link>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section style={{ padding: '3rem 1.5rem', background: 'var(--bg-main)' }}>
        <div className="container">
          <div className="grid-4">
            {stats.map((s, i) => (
              <div key={i} className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  background: `${s.color}15`, color: s.color,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1rem',
                }}>
                  <s.icon size={28} />
                </div>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '4rem 1.5rem', background: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              How It Works
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>From Surplus to Sustenance in 4 Steps</h2>
          </div>
          <div className="grid-4">
            {howItWorks.map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary-600), var(--primary-400))',
                  color: '#fff', fontWeight: 800, fontSize: '1.1rem',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}>
                  {item.step}
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: '4rem 1.5rem', background: 'var(--bg-main)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Our Values
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>What Drives Us</h2>
          </div>
          <div className="grid-3">
            {values.map((v, i) => (
              <div key={i} className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  background: 'var(--primary-50)', color: 'var(--primary-600)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}>
                  <v.icon size={28} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>{v.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '4rem 1.5rem', textAlign: 'center', background: 'linear-gradient(135deg, #ecfdf5, #ffffff)' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem' }}>Ready to Make a Difference?</h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.65 }}>
            Whether you're a donor with surplus food, an NGO serving communities, or a volunteer who can help with pickups — there's a role for you.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">Get Started Today</Link>
            <Link to="/contact" className="btn btn-secondary btn-lg">Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
