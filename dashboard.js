(function () {
  const {
    STORAGE_KEYS,
    qs,
    qsa,
    readStorage,
    writeStorage,
    daysUntil,
    formatDate,
  } = window.PharmaCare;

  function countdownText(days) {
    if (days <= 0) return 'Refill due now';
    if (days === 1) return 'Refill in 1 day';
    return `Refill in ${days} days`;
  }

  function requestRefill(id) {
    const prescriptions = readStorage(STORAGE_KEYS.prescriptions, []);
    const idx = prescriptions.findIndex((p) => p.id === id);
    if (idx === -1) return;

    const next = new Date(
      Date.now() + 1000 * 60 * 60 * 24 * 30
    ).toISOString();

    prescriptions[idx].refillDate = next;
    writeStorage(STORAGE_KEYS.prescriptions, prescriptions);

    const { addAgentMessage } = window.PharmaCare;
    if (typeof addAgentMessage === 'function') {
      addAgentMessage(
        `Refill requested for ${prescriptions[idx].name}. Next refill is ${formatDate(
          next
        )}.`
      );
    }

    renderDashboard();
  }

  function snoozeRefill(id) {
    const prescriptions = readStorage(STORAGE_KEYS.prescriptions, []);
    const idx = prescriptions.findIndex((p) => p.id === id);
    if (idx === -1) return;

    prescriptions[idx].refillDate = new Date(
      new Date(prescriptions[idx].refillDate).getTime() +
        1000 * 60 * 60 * 24
    ).toISOString();

    writeStorage(STORAGE_KEYS.prescriptions, prescriptions);
    renderDashboard();
  }

  function onDashboardClick(e) {
    const refillBtn = e.target.closest('[data-refill]');
    if (refillBtn) requestRefill(refillBtn.dataset.refill);

    const snoozeBtn = e.target.closest('[data-snooze]');
    if (snoozeBtn) snoozeRefill(snoozeBtn.dataset.snooze);
  }

  function renderDashboard() {
    const listEl = qs('#prescription-list');
    const alertsEl = qs('#alerts');
    const prescriptions = readStorage(STORAGE_KEYS.prescriptions, []);

    alertsEl.innerHTML = '';
    listEl.innerHTML = '';

    if (prescriptions.length === 0) {
      listEl.innerHTML = '<p>No prescriptions yet. Add one from Upload.</p>';
      return;
    }

    const due = prescriptions.filter((p) => daysUntil(p.refillDate) <= 0);
    const soon = prescriptions.filter((p) => {
      const d = daysUntil(p.refillDate);
      return d > 0 && d <= 3;
    });

    due.forEach((p) => {
      const div = document.createElement('div');
      div.className = 'alert due';
      div.innerHTML = `
        ⏰ Refill due now: <strong>${p.name}</strong>
        <button class="btn" data-refill="${p.id}">Request Refill</button>
      `;
      alertsEl.appendChild(div);
    });

    soon.forEach((p) => {
      const div = document.createElement('div');
      div.className = 'alert';
      div.textContent = `Reminder: ${p.name} refill in ${daysUntil(
        p.refillDate
      )} days.`;
      alertsEl.appendChild(div);
    });

    prescriptions.forEach((p) => {
      const days = daysUntil(p.refillDate);

      const card = document.createElement('article');
      card.className = 'card';

      card.innerHTML = `
        <h3>${p.name}</h3>
        <div class="meta">Dosage: ${p.dosage}</div>
        <div class="pill ${
          days <= 0 ? 'danger' : days <= 3 ? 'warn' : ''
        }">
          ${countdownText(days)}
        </div>
        <div class="meta">Refill date: ${formatDate(p.refillDate)}</div>
        <div class="actions">
          <button class="btn primary" data-refill="${p.id}">
            Request Refill
          </button>
          <button class="btn" data-snooze="${p.id}">
            Snooze 1 day
          </button>
        </div>
      `;

      listEl.appendChild(card);
    });

    listEl.addEventListener('click', onDashboardClick);
    alertsEl.addEventListener('click', onDashboardClick);
  }

  window.PharmaCare.renderDashboard = renderDashboard;
})();
