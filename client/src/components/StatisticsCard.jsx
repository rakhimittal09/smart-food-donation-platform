import React from 'react';

const StatisticsCard = ({
  title,
  value,
  icon: Icon,
  variant = 'primary', // 'primary', 'amber', 'indigo', 'sky', 'rose'
  subtext,
  trend,
}) => {
  const iconVariants = {
    primary: 'stat-icon-wrapper',
    amber: 'stat-icon-wrapper stat-icon-amber',
    indigo: 'stat-icon-wrapper stat-icon-indigo',
    sky: 'stat-icon-wrapper stat-icon-sky',
    rose: 'stat-icon-wrapper stat-icon-rose',
  };

  const cardVariants = {
    primary: 'stat-card',
    amber: 'stat-card stat-amber',
    indigo: 'stat-card stat-indigo',
    sky: 'stat-card stat-sky',
    rose: 'stat-card stat-rose',
  };

  return (
    <div className={cardVariants[variant] || 'stat-card'}>
      <div style={{ flex: 1 }}>
        <div className="stat-label">{title}</div>
        <div className="stat-value" style={{ marginTop: '0.25rem' }}>
          {value !== undefined && value !== null ? value : 0}
        </div>
        {(subtext || trend) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem', fontSize: '0.775rem' }}>
            {trend && (
              <span style={{ color: trend.startsWith('+') ? 'var(--primary-600)' : 'var(--rose-600)', fontWeight: 700 }}>
                {trend}
              </span>
            )}
            {subtext && <span style={{ color: 'var(--text-light)' }}>{subtext}</span>}
          </div>
        )}
      </div>

      {Icon && (
        <div className={iconVariants[variant] || 'stat-icon-wrapper'}>
          <Icon size={26} />
        </div>
      )}
    </div>
  );
};

export default StatisticsCard;
