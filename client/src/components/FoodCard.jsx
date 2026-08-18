import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Calendar, ArrowRight, UserCheck, CheckCircle, AlertCircle } from 'lucide-react';

const FoodCard = ({ donation, onRequestClick, isDonorView = false }) => {
  if (!donation) return null;

  const {
    _id,
    foodName,
    description,
    category,
    quantity,
    unit,
    foodType,
    expiryDate,
    pickupDate,
    pickupTime,
    city,
    image,
    status,
    donor,
  } = donation;

  // Calculate remaining time
  const calculateRemaining = () => {
    const diff = new Date(expiryDate) - new Date();
    if (diff <= 0) return { expired: true, text: 'Expired' };
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return { expired: false, text: `${days}d ${hours % 24}h left`, urgent: days <= 1 };
    return { expired: false, text: `${hours}h left`, urgent: true };
  };

  const timeLeft = calculateRemaining();

  const getFoodTypeBadge = (type) => {
    switch (type) {
      case 'Veg':
        return <span className="badge badge-veg">🌱 Veg</span>;
      case 'Non-Veg':
        return <span className="badge badge-nonveg">🍗 Non-Veg</span>;
      case 'Vegan':
        return <span className="badge badge-vegan">🥬 Vegan</span>;
      case 'Egg':
        return <span className="badge badge-amber">🥚 Egg</span>;
      default:
        return <span className="badge">{type}</span>;
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'Available':
        return <span className="badge badge-available">● Available</span>;
      case 'Requested':
        return <span className="badge badge-requested">● Requested</span>;
      case 'Approved':
        return <span className="badge badge-approved">● Approved</span>;
      case 'Pickup Scheduled':
        return <span className="badge badge-scheduled">● Scheduled</span>;
      case 'Completed':
      case 'Delivered':
        return <span className="badge badge-completed">✓ Delivered</span>;
      default:
        return <span className="badge badge-rejected">{st}</span>;
    }
  };

  const defaultFoodImages = {
    'Cooked Meals': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    'Packaged Food': 'https://images.unsplash.com/photo-1584473457406-6240486418e9?auto=format&fit=crop&w=600&q=80',
    'Fruits & Vegetables': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
    'Bakery & Bread': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    'Dairy & Beverages': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
    'Grains & Pulses': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
  };

  const displayImage = image
    ? image.startsWith('http') || image.startsWith('/uploads')
      ? image
      : `http://localhost:5000${image}`
    : defaultFoodImages[category] || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80';

  return (
    <div
      className="card"
      style={{
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      {/* Image Banner & Overlays */}
      <div style={{ position: 'relative', height: '180px', background: '#f1f5f9', overflow: 'hidden' }}>
        <img
          src={displayImage}
          alt={foodName}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 300ms ease' }}
          onMouseOver={(e) => (e.target.style.transform = 'scale(1.05)')}
          onMouseOut={(e) => (e.target.style.transform = 'scale(1.0)')}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Top Badges */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {getFoodTypeBadge(foodType)}
          {getStatusBadge(status)}
        </div>

        {/* Quantity Pill */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            background: 'rgba(15, 23, 42, 0.85)',
            color: '#ffffff',
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.775rem',
            fontWeight: 700,
            backdropFilter: 'blur(4px)',
          }}
        >
          {quantity} {unit}
        </div>
      </div>

      {/* Content Body */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Category & Expiry row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {category}
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: timeLeft.expired ? 'var(--rose-600)' : timeLeft.urgent ? 'var(--amber-600)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <Clock size={13} /> {timeLeft.text}
          </span>
        </div>

        {/* Food Title */}
        <h3
          style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            marginBottom: '0.4rem',
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {foodName}
        </h3>

        {/* Short Description */}
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            marginBottom: '1rem',
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {description}
        </p>

        {/* Location and Donor info */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={14} style={{ color: 'var(--primary-600)', flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {city}
            </span>
          </div>
          {donor && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <UserCheck size={14} style={{ color: 'var(--sky-600)', flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {donor.organizationName || donor.name}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link
            to={`/donations/${_id}`}
            className="btn btn-secondary btn-sm"
            style={{ flex: 1 }}
          >
            Details
          </Link>

          {onRequestClick && status === 'Available' && !timeLeft.expired && (
            <button
              onClick={() => onRequestClick(donation)}
              className="btn btn-primary btn-sm"
              style={{ flex: 1.2 }}
            >
              Request Food
            </button>
          )}

          {isDonorView && (
            <Link
              to={`/donations/edit/${_id}`}
              className="btn btn-outline btn-sm"
            >
              Edit
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
