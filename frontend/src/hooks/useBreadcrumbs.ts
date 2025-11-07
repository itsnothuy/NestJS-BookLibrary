import { useLocation, useParams } from 'react-router-dom';
import { breadcrumbConfig } from '../config/breadcrumbs';

export interface Breadcrumb {
  path: string;
  label: string;
  isActive: boolean;
}

export function useBreadcrumbs() {
  const location = useLocation();
  const params = useParams();

  const generateBreadcrumbs = (): Breadcrumb[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: Breadcrumb[] = [];

    // Always include home unless we're already on home
    if (location.pathname !== '/') {
      breadcrumbs.push({
        path: '/',
        label: 'Home',
        isActive: false
      });
    }

    // Build breadcrumbs from path segments
    let currentPath = '';
    for (let i = 0; i < pathSegments.length; i++) {
      currentPath += `/${pathSegments[i]}`;
      
      // Find matching config
      const config = breadcrumbConfig.find(config => {
        if (config.dynamic) {
          // Replace :param with actual values for matching
          const pattern = config.path.replace(/:[^/]+/g, '[^/]+');
          return new RegExp(`^${pattern}$`).test(currentPath);
        }
        return config.path === currentPath;
      });

      if (config) {
        const label = typeof config.label === 'function' 
          ? config.label(params) 
          : config.label;

        breadcrumbs.push({
          path: currentPath,
          label,
          isActive: i === pathSegments.length - 1
        });
      } else {
        // For unknown paths, create a default breadcrumb
        const segmentLabel = pathSegments[i]
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        breadcrumbs.push({
          path: currentPath,
          label: segmentLabel,
          isActive: i === pathSegments.length - 1
        });
      }
    }

    return breadcrumbs;
  };

  return generateBreadcrumbs();
}