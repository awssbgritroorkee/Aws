import { useEffect } from 'react';

/**
 * Helper hook to set page title and description meta tag per route
 */
export const usePageTitle = (title, description) => {
  useEffect(() => {
    document.title = `${title} | AWS SBG RIT`;

    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute('content', description);
      }
    }
  }, [title, description]);
};

export default usePageTitle;
