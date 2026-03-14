import React from 'react';

function CircularProgress({ percentage, size = 200, strokeWidth = 20 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      position: 'relative'
    }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#10b981"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center'
      }}>
        <div style={{ 
          fontSize: '48px', 
          fontWeight: 'bold', 
          color: '#10b981',
          lineHeight: 1
        }}>
          {percentage}%
        </div>
        <div style={{ 
          fontSize: '14px', 
          color: '#64748b',
          marginTop: '8px',
          fontWeight: '600'
        }}>
          Complete
        </div>
      </div>
    </div>
  );
}

export default CircularProgress;
