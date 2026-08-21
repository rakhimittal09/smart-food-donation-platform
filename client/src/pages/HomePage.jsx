import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { donationService } from '../services/donationService';
import FoodCard from '../components/FoodCard';
import {
  HeartHandshake,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  Users,
  Utensils,
  ChevronDown,
  Award,
  Clock,
  CheckCircle,
} from 'lucide-react';

const HomePage = () => {
  const [featuredDonations, setFeaturedDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const res = await donationService.getDonations({ limit: 3, status: 'Available' });
        if (res.success && res.data) {
          setFeaturedDonations(res.data);
        }
      } catch (err) {
        console.error('Failed to load featured food:', err);
      } finally {
        setLoading(false);
      }
    };
    loadFeatured();
  }, []);

  const faqs = [
    {
      q: 'Who is eligible to donate surplus food on NourishLink?',
      a: 'Any individual, restaurant, caterer, banquet hall, grocery store, or corporate kitchen with surplus edible, hygienic food can register as a Donor and list items for donation.',
    },
    {
      q: 'Who can request and collect food donations?',
      a: 'Registered NGOs, orphanages, old age homes, food banks, and charitable community organizations can register as Receivers to browse, request, and collect surplus food.',
    },
    {
      q: 'How does pickup coordination and verification work?',
      a: 'When an NGO requests a pickup, the donor accepts it. The status then moves from Pending to Accepted, then Picked Up, and finally Delivered. Each step is recorded in the donation activity history.',
    },
    {
      q: 'Is there any fee to use the platform?',
      a: 'No, NourishLink is a 100% free community platform dedicated to eradicating hunger and achieving zero food waste.',
    },
  ];

  return (
    <div className="animate-fade-in">
      
      {/* ── HERO SECTION ──────────────────────────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          padding: '5rem 0 4rem 0',
          background: 'linear-gradient(180deg, #ecfdf5 0%, #f8fafc 100%)',
          overflow: 'hidden',
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
            
            {/* Left Content */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 1rem',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--primary-800)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  marginBottom: '1.25rem',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                }}
              >
                <Sparkles size={16} className="text-emerald-600" />
                Zero Food Waste Movement
              </div>

              <h1
                style={{
                  fontSize: 'clamp(2.4rem, 5vw, 3.5rem)',
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                  marginBottom: '1.25rem',
                }}
              >
                Turn Surplus Food Into <br />
                <span style={{ color: 'var(--primary-600)', textDecoration: 'underline wavy var(--primary-300)' }}>
                  Smiles & Hope.
                </span>
              </h1>

              <p
                style={{
                  fontSize: '1.1rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.7,
                  marginBottom: '2rem',
                  maxWidth: '520px',
                }}
              >
                Connect restaurants, caterers, and food businesses directly with verified NGOs and shelters in real-time. Fast pickup, safe handovers, zero hunger.
              </p>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/donations/create" className="btn btn-primary btn-lg" style={{ gap: '0.6rem' }}>
                  <HeartHandshake size={20} /> Donate Food Now
                </Link>
                <Link to="/donations" className="btn btn-secondary btn-lg" style={{ gap: '0.6rem' }}>
                  Browse Food <ArrowRight size={18} />
                </Link>
              </div>

              {/* Verified Trust Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <CheckCircle size={18} style={{ color: 'var(--primary-600)' }} />
                  <span>100% Free Service</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <CheckCircle size={18} style={{ color: 'var(--primary-600)' }} />
                  <span>Verified NGO Network</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <CheckCircle size={18} style={{ color: 'var(--primary-600)' }} />
                  <span>Tracked Pickup Delivery</span>
                </div>
              </div>
            </div>

            {/* Right Graphic / Live Preview Card */}
            <div style={{ position: 'relative' }}>
              <div
                className="glass-card"
                style={{
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-xl)',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid rgba(255, 255, 255, 0.9)',
                }}
              >
                <div style={{ position: 'relative', height: '240px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '1.25rem' }}>
                  <img
                    src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80"
                    alt="Food distribution impact"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'rgba(16, 185, 129, 0.9)',
                      color: '#ffffff',
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    ● 100+ Meals Available Now
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Fresh Biryani & Curry Servings</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Donated by Taj Imperial Kitchen</p>
                  </div>
                  <span className="badge badge-veg">🌱 Veg</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.825rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={15} style={{ color: 'var(--primary-600)' }} />
                    <span>Expires in 4 hours</span>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--primary-700)' }}>45 Servings</span>
                </div>
              </div>

              {/* Floating Mini Badge */}
              <div
                className="glass"
                style={{
                  position: 'absolute',
                  bottom: '-20px',
                  left: '-20px',
                  padding: '0.85rem 1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--amber-100)', color: 'var(--amber-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Truck size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Fast Pickup</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg. 45 min response</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── IMPACT STATS STRIP ────────────────────────────────────────────────── */}
      <section style={{ padding: '2.5rem 0', background: '#0f172a', color: '#ffffff' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--primary-400)', fontFamily: 'var(--font-heading)' }}>
                50,000+
              </div>
              <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.2rem' }}>Meals Rescued</div>
            </div>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-heading)' }}>
                450+
              </div>
              <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.2rem' }}>Active Food Donors</div>
            </div>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'var(--font-heading)' }}>
                120+
              </div>
              <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.2rem' }}>Verified NGO Partners</div>
            </div>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#a78bfa', fontFamily: 'var(--font-heading)' }}>
                18 Tons
              </div>
              <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.2rem' }}>CO₂ Emissions Saved</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section style={{ padding: '5rem 0', background: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem auto' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Simple 4-Step Process
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.4rem' }}>
              How NourishLink Connects Surplus to Need
            </h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.75rem', fontSize: '1rem' }}>
              Our transparent, real-time platform simplifies food redistribution from preparation to plate.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
            
            {/* Step 1 */}
            <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem', position: 'relative' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'var(--primary-50)',
                  color: 'var(--primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto',
                }}
              >
                <Utensils size={26} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>1. List Surplus Food</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Donors specify food item, servings quantity, veg/non-veg status, location, and expiry window.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem', position: 'relative' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'var(--amber-50)',
                  color: 'var(--amber-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto',
                }}
              >
                <Users size={26} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>2. NGO Discovers & Requests</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Nearby verified shelters & NGOs request available items with intended distribution details.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem', position: 'relative' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'var(--sky-50)',
                  color: 'var(--sky-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto',
                }}
              >
                <Truck size={26} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>3. Track Pickup</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Donor accepts the request. Status moves Pending → Accepted → Picked Up → Delivered, with a full activity log.
              </p>
            </div>

            {/* Step 4 */}
            <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem', position: 'relative' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'var(--indigo-50)',
                  color: 'var(--indigo-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto',
                }}
              >
                <ShieldCheck size={26} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>4. Community Fed</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Meals are distributed to underprivileged communities, instantly logged into platform analytics.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── FEATURED RECENT DONATIONS SHOWCASE ────────────────────────────────── */}
      <section style={{ padding: '4.5rem 0', background: 'var(--bg-main)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Real-Time Listings
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.3rem' }}>
                Available Surplus Food Listings
              </h2>
            </div>
            <Link to="/donations" className="btn btn-outline btn-sm" style={{ gap: '0.4rem' }}>
              View All Donations <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid-3">
            {featuredDonations.map((donation) => (
              <FoodCard key={donation._id} donation={donation} />
            ))}
          </div>

          {featuredDonations.length === 0 && !loading && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>Explore our catalog to view active food listings in your region.</p>
              <Link to="/donations" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
                Browse Food Catalog
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── FAQ SECTION ──────────────────────────────────────────────────────── */}
      <section style={{ padding: '4.5rem 0', background: '#ffffff' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Frequently Asked Questions</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Everything you need to know about participating in the food rescue network.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="card"
                style={{ padding: '1.25rem', cursor: 'pointer' }}
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.975rem' }}>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: activeFaq === i ? 'rotate(180deg)' : 'none',
                      transition: 'transform 200ms ease',
                      color: 'var(--primary-600)',
                    }}
                  />
                </div>
                {activeFaq === i && (
                  <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.7', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION BANNER ────────────────────────────────────────────── */}
      <section style={{ padding: '4.5rem 0', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#ffffff', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '680px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem' }}>
            Ready to Help Eradicate Food Waste?
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)', lineHeight: '1.7', marginBottom: '2rem' }}>
            Join hundreds of restaurants, hotels, and charitable trusts already making a daily community difference.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-lg" style={{ background: '#ffffff', color: 'var(--primary-700)', fontWeight: 700 }}>
              Join As Food Donor / NGO
            </Link>
            <Link to="/donations" className="btn btn-lg btn-secondary" style={{ background: 'rgba(0,0,0,0.2)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}>
              Explore Platform
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
