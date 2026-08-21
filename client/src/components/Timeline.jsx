import React from 'react';
import { CheckCircle2, Clock, Truck, PackageCheck, XCircle } from 'lucide-react';

const Timeline = ({ currentStatus, timeline = [], rejectionReason = '' }) => {
  const steps = [
    { key: 'Pending', label: 'Pending', icon: Clock, desc: 'NGO requested pickup' },
    { key: 'Accepted', label: 'Accepted', icon: CheckCircle2, desc: 'Donor accepted the request' },
    { key: 'Picked Up', label: 'Picked Up', icon: Truck, desc: 'Food collected from donor' },
    { key: 'Delivered', label: 'Delivered', icon: PackageCheck, desc: 'Food delivered to those in need' },
  ];

  const order = ['Pending', 'Accepted', 'Picked Up', 'Delivered'];

  const getStepStatus = (stepKey) => {
    if (currentStatus === 'Rejected' || currentStatus === 'Cancelled') {
      return stepKey === 'Pending' ? 'completed' : 'cancelled';
    }

    const currentIdx = order.indexOf(currentStatus);
    const stepIdx = order.indexOf(stepKey);

    if (currentIdx === -1) return 'upcoming';
    if (currentIdx > stepIdx) return 'completed';
    if (currentIdx === stepIdx) return 'active';
    return 'upcoming';
  };

  return (
    <div style={{ margin: '1.5rem 0' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          position: 'relative',
          marginBottom: '2.5rem',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '24px',
            left: '30px',
            right: '30px',
            height: '4px',
            background: 'var(--border-color)',
            zIndex: 1,
          }}
        />

        {steps.map((step) => {
          const status = getStepStatus(step.key);
          const Icon = step.icon;
          const isCompleted = status === 'completed';
          const isActive = status === 'active';
          const isCancelled = status === 'cancelled';

          return (
            <div
              key={step.key}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
                zIndex: 2,
                flex: 1,
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: isCompleted
                    ? 'var(--primary-600)'
                    : isActive
                    ? 'var(--amber-500)'
                    : isCancelled
                    ? 'var(--rose-500)'
                    : '#ffffff',
                  border: isCompleted || isActive || isCancelled ? '4px solid #ffffff' : '3px solid var(--border-color)',
                  boxShadow: isCompleted || isActive ? '0 0 0 3px rgba(16, 185, 129, 0.2)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isCompleted || isActive || isCancelled ? '#ffffff' : 'var(--text-light)',
                  transition: 'all var(--trans-base)',
                  marginBottom: '0.65rem',
                }}
              >
                {isCancelled ? <XCircle size={22} /> : <Icon size={22} />}
              </div>

              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: isCompleted || isActive ? 'var(--text-main)' : 'var(--text-muted)' }}>
                {step.label}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.2rem', maxWidth: '140px' }}>
                {step.desc}
              </div>
            </div>
          );
        })}
      </div>

      {(currentStatus === 'Rejected' || currentStatus === 'Cancelled') && (
        <div
          style={{
            padding: '1rem 1.25rem',
            background: 'var(--rose-50)',
            border: '1px solid var(--rose-200)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--rose-800)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem',
          }}
        >
          <XCircle size={24} style={{ color: 'var(--rose-600)', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700 }}>Request {currentStatus}</div>
            <div style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>
              {rejectionReason ? `Reason: ${rejectionReason}` : 'This pickup request has been closed.'}
            </div>
          </div>
        </div>
      )}

      {timeline.length > 0 && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Activity History</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {timeline.map((entry, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  paddingBottom: i < timeline.length - 1 ? '0.75rem' : 0,
                  borderBottom: i < timeline.length - 1 ? '1px solid var(--border-color)' : 'none',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--primary-600)',
                    marginTop: '6px',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                      {entry.title}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {entry.description && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {entry.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Timeline;
