window.addEventListener('DOMContentLoaded', function () {
  function preauthorize(token) {
    if (window.ui && window.ui.preauthorizeApiKey) {
      window.ui.preauthorizeApiKey('bearer', token);
      setTimeout(() => {
        alert('[Swagger] JWT token injected');
      }, 200);
      console.log('[Swagger] JWT token injected');
    } else {
      console.log('[Swagger] Waiting for window.ui...');
    }
  }

  const savedToken = localStorage.getItem('swagger_jwt');
  if (savedToken) {
    const observer = new MutationObserver(() => {
      if (window.ui && window.ui.preauthorizeApiKey) {
        preauthorize(savedToken);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  const origFetch = window.fetch;
  window.fetch = async function (...args) {
    try {
      const response = await origFetch.apply(this, args);
      if (
        typeof args[0] === 'string' && args[0].includes('/auth/login') &&
        response.ok
      ) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await response.clone().json();
          console.log('[Swagger] Login response:', data);
          if (data.access_token) {
            localStorage.setItem('swagger_jwt', data.access_token);
            preauthorize(data.access_token);
          }
        } else {
          console.warn('[Swagger] Login response is not JSON:', response);
        }
      }
      return response;
    } catch (err) {
      console.error('[Swagger] fetch patch error:', err);
      return origFetch.apply(this, args);
    }
  };
});