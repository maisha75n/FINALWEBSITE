(function () {
  function init() {
    const {
      ensureSeedData,
      initNav,
      initUpload,
      initChat,
      initProfile,
      initWellness,
      initHealthMetrics,
      renderDashboard,
      renderMoodCalendar,
      startCountdownTicker,
      setYear,
    } = window.PharmaCare;

    if (typeof ensureSeedData === 'function') ensureSeedData();
    if (typeof initNav === 'function') initNav();
    if (typeof initUpload === 'function') initUpload();
    if (typeof initChat === 'function') initChat();
    if (typeof initProfile === 'function') initProfile();
    if (typeof initWellness === 'function') initWellness();
    if (typeof initHealthMetrics === 'function') initHealthMetrics();
    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof renderMoodCalendar === 'function') renderMoodCalendar();
    if (typeof startCountdownTicker === 'function') startCountdownTicker();
    if (typeof setYear === 'function') setYear();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
