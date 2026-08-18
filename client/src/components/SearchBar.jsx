import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ onSearch, placeholder = 'Search by food title, city, description...', defaultValue = '' }) => {
  const [searchTerm, setSearchTerm] = useState(defaultValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search
          size={18}
          style={{
            position: 'absolute',
            left: '14px',
            color: 'var(--text-light)',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          className="form-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          style={{
            paddingLeft: '42px',
            paddingRight: searchTerm ? '70px' : '40px',
            borderRadius: 'var(--radius-full)',
            height: '46px',
            fontSize: '0.925rem',
            background: '#ffffff',
            boxShadow: 'var(--shadow-sm)',
          }}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: '12px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-light)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;
