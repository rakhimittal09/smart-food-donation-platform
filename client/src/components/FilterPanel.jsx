import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

const FilterPanel = ({ filters, onFilterChange, onReset }) => {
  const foodTypes = ['All Types', 'Veg', 'Non-Veg', 'Vegan', 'Egg'];

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
          Filter by Location, Food Type & Status
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
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '0.8rem' }}>Location</label>
          <input
            type="text"
            className="form-input"
            placeholder="City, state, or address"
            value={filters.location || ''}
            onChange={(e) => onFilterChange('location', e.target.value)}
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '0.8rem' }}>Food Type</label>
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

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '0.8rem' }}>Status</label>
          <select
            className="form-select"
            value={filters.status || 'Available'}
            onChange={(e) => onFilterChange('status', e.target.value)}
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
          >
            <option value="Available">Available</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Picked Up">Picked Up</option>
            <option value="Delivered">Delivered</option>
            <option value="all">All Statuses</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
