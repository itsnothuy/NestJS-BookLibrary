import { useNavigate } from 'react-router-dom';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';

export default function Breadcrumbs() {
  const breadcrumbs = useBreadcrumbs();
  const navigate = useNavigate();

  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs for single-level pages
  }

  return (
    <nav style={{
      padding: '12px 24px',
      backgroundColor: '#f8fafc',
      borderBottom: '1px solid #e2e8f0',
      fontSize: '14px'
    }}>
      <ol style={{
        display: 'flex',
        alignItems: 'center',
        listStyle: 'none',
        margin: 0,
        padding: 0,
        gap: '4px'
      }}>
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.path} style={{ display: 'flex', alignItems: 'center' }}>
            {index > 0 && (
              <span style={{ 
                margin: '0 8px', 
                color: '#64748b',
                fontSize: '14px',
                userSelect: 'none'
              }}>
                /
              </span>
            )}
            
            {breadcrumb.isActive ? (
              <span style={{
                color: '#0f172a',
                fontWeight: '600',
                fontSize: '14px'
              }}>
                {breadcrumb.label}
              </span>
            ) : (
              <button
                onClick={() => navigate(breadcrumb.path)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  transition: 'all 0.2s ease',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#eff6ff';
                  e.currentTarget.style.color = '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#3b82f6';
                }}
                title={`Go to ${breadcrumb.label}`}
              >
                {breadcrumb.label}
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}