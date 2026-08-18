import React from 'react';

// Responsive Bar Chart Component
export const BarChart = ({ data = [], title = 'Donation Statistics', valueKey = 'count', labelKey = '_id' }) => {
  const maxValue = Math.max(...data.map((d) => d[valueKey] || 0), 1);

  return (
    <div className="card">
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-main)' }}>
        {title}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {data.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
            No data points available
          </div>
        ) : (
          data.map((item, index) => {
            const label = item[labelKey] || 'Unspecified';
            const val = item[valueKey] || 0;
            const percentage = Math.round((val / maxValue) * 100);

            const colors = [
              'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
              'linear-gradient(90deg, #0ea5e9 0%, #38bdf8 100%)',
              'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
              'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
              'linear-gradient(90deg, #f43f5e 0%, #fb7185 100%)',
              'linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)',
            ];

            return (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', fontWeight: 600 }}>
                  <span style={{ color: 'var(--text-main)' }}>{label}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{val} listings ({percentage}%)</span>
                </div>
                <div
                  style={{
                    height: '10px',
                    width: '100%',
                    background: 'var(--bg-main)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${percentage}%`,
                      background: colors[index % colors.length],
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 600ms cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Donut / Pie Breakdown Component
export const DonutChart = ({ data = [], title = 'Distribution by Type' }) => {
  const total = data.reduce((sum, item) => sum + (item.count || 0), 0) || 1;

  const colorPalette = ['#10b981', '#f59e0b', '#0ea5e9', '#6366f1', '#f43f5e', '#8b5cf6'];

  return (
    <div className="card">
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-main)' }}>
        {title}
      </h3>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Simple visual percentage segments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
          {data.map((item, idx) => {
            const percentage = Math.round(((item.count || 0) / total) * 100);
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '3px',
                      background: colorPalette[idx % colorPalette.length],
                    }}
                  />
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item._id || 'Standard'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--primary-700)' }}>{item.count}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.775rem', width: '40px', textAlign: 'right' }}>
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
