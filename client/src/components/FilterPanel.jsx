import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

const FilterPanel = ({ filters, onFilterChange, onReset }) => {
  const categories = [
    'All Categories',
    'Cooked Meals',
    'Packaged Food',
    'Fruits & Vegetables',
    'Bakery & Bread',
    'Dairy & Beverages',
    'Grains & Pulses',
  ];

  const foodTypes = ['All Types', 'Veg', 'Non-Veg', 'Vegan', 'Egg'];

  const cities = ['All Cities', 'New Delhi', 'Mumbai', 'Bengaluru', 'Pune', 'Hyderabad', 'Kolkata', 'Chennai'];

  const statuses = ['Available', 'Requested', 'Approved', 'Completed', 'all'];

  return (
    <div
      className="card"
      style={{
        padding: '1.25rem',
        marginBottom: '1.5rem',
        background: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem' }}>
          <Filter size={18} style={{ color: 'var(--primary-600)' }} />
          Filter & Refine Food Listings
        </div>
        <button
          onClick={onReset}
          className="btn btn-secondary btn-sm"
          style={{ gap: '0.35rem', fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        
        {/* Category Filter */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '0.8rem' }}>Category</label>
          <select
            className="form-select"
            value={filters.category || 'all'}
            onChange={(e) => onFilterChange('category', e.target.value === 'All Categories' ? 'all' : e.target.value)}
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
          >
            {categories.map((c) => (
              <option key={c} value={c === 'All Categories' ? 'all' : c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Dietary / Food Type */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '0.8rem' }}>Dietary / Food Type</label>
          <select
            className="form-select"
            value={filters.foodType || 'all'}
            onChange={(e) => onFilterChange('foodType', e.target.value === 'All Types' ? 'all' : e.target.value)}
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
          >
            {foodTypes.map((ft) => (
              <option key={ft} value={ft === 'All Types' ? 'all' : ft}>
                {ft}
              </option>
            ))}
          </select>
        </div>

        {/* City Filter */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '0.8rem' }}>City / Region</label>
          <select
            className="form-select"
            value={filters.city || 'all'}
            onChange={(e) => onFilterChange('city', e.target.value === 'All Cities' ? 'all' : e.target.value)}
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
          >
            {cities.map((city) => (
              <option key={city} value={city === 'All Cities' ? 'all' : city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '0.8rem' }}>Listing Status</label>
          <select
            className="form-select"
            value={filters.status || 'Available'}
            onChange={(e) => onFilterChange('status', e.target.value)}
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
          >
            <option value="Available">Available (Active)</option>
            <option value="Requested">Requested</option>
            <option value="Approved">Approved</option>
            <option value="Completed">Completed / Delivered</option>
            <option value="all">All Statuses</option>
          </select>
        </div>

      </div>
    </div>
  );
};

export default FilterPanel;
