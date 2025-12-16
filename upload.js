(function () {
  const {
    STORAGE_KEYS,
    qs,
    readStorage,
    writeStorage,
    generateId,
    formatDate,
  } = window.PharmaCare;

  function initUpload() {
    const form = qs('#upload-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = qs('#medicationName').value.trim();
      const dosage = qs('#dosage').value.trim();
      const refillDate = qs('#refillDate').value;

      if (!name || !dosage || !refillDate) return;

      const prescriptions = readStorage(STORAGE_KEYS.prescriptions, []);
      prescriptions.unshift({
        id: generateId('rx'),
        name,
        dosage,
        refillDate: new Date(refillDate).toISOString(),
        taken: {}, // daily taken state
      });

      writeStorage(STORAGE_KEYS.prescriptions, prescriptions);
      form.reset();

      const { setActiveSection, addAgentMessage, renderDashboard } = window.PharmaCare;
      if (typeof setActiveSection === 'function') setActiveSection('dashboard');
      if (typeof addAgentMessage === 'function') {
        addAgentMessage(
          `Added new prescription: ${name} (${dosage}). Refill on ${formatDate(
            refillDate,
          )}.`,
        );
      }
      if (typeof renderDashboard === 'function') renderDashboard();
    });
  }

  window.PharmaCare.initUpload = initUpload;
})();
