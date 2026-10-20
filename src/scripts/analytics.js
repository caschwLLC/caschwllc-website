(() => {
  const config = document.currentScript?.dataset;
  if (
    !config ||
    location.protocol !== 'https:' ||
    location.hostname !== config.hostname ||
    [navigator.doNotTrack, window.doNotTrack].some(
      (value) => value === '1' || value === 'yes',
    )
  )
    return;

  const script = document.createElement('script');
  script.src = config.scriptUrl;
  script.defer = true;
  script.dataset.websiteId = config.websiteId;
  script.dataset.autoTrack = 'false';
  script.dataset.doNotTrack = 'true';
  script.dataset.excludeSearch = 'true';
  script.dataset.excludeHash = 'true';
  script.dataset.domains = config.hostname;
  let ready = false;

  function send(name, data) {
    if (!ready || typeof window.umami?.track !== 'function') return;
    const referrer = document.referrer;
    const payload = {
      website: config.websiteId,
      hostname: config.hostname,
      url: location.pathname,
      title: document.title,
      referrer: referrer ? new URL(referrer).origin : '',
    };
    if (name) Object.assign(payload, { name, data });
    void window.umami.track(payload);
  }

  script.addEventListener('load', () => {
    ready = true;
    send();
  });
  script.addEventListener('error', () => {
    console.warn('Website analytics unavailable; navigation is unaffected.');
  });
  function action(event) {
    if (!(event.target instanceof Element)) return;
    if (event.type === 'click' ? event.button !== 0 : event.button !== 1)
      return;
    const link = event.target.closest('a[data-analytics-event]');
    if (!link) return;
    const {
      analyticsEvent: name,
      analyticsApp: app,
      analyticsVersion: version,
    } = link.dataset;
    if (name === 'download_click' && app && version)
      send(name, { app, version });
    else if (name === 'store_click' && app) send(name, { app });
  }
  document.addEventListener('click', action, { passive: true });
  document.addEventListener('auxclick', action, { passive: true });
  document.head.append(script);
})();
