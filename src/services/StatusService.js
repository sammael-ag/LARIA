/**
 * StatusService: Špión v éteri.
 * Sleduje main.go a sw.js nezávisle od App.js.
 */

export const getSystemStatus = async () => {
  let status = {
    gopher: false,
    pwa: false,
  };

  try {
    // 1. Check Gophera (main.go)
    const gopherCheck = await fetch('/api/native/status').catch(() => ({ ok: false }));
    status.gopher = gopherCheck.ok;

    // 2. Check Service Workera
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      status.pwa = !!registration;
    }

    return status;
  } catch (e) {
    return status;
  }
};