(function () {
  const {
    STORAGE_KEYS,
    qs,
    qsa,
    readStorage,
    writeStorage,
    daysUntil,
    formatDate,
    dateKey,
  } = window.PharmaCare;

  function countdownText(days) {
    if (days <= 0) return 'Refill due now';
    if (days === 1) return 'Refill in 1 day';
    return `Refill in ${days} days`;
  }

  function toggleTaken(id) {
    const today = dateKey(new Date());
    const prescriptions = readStorage(STORAGE_KEYS.prescriptions, []);
    const rx = prescriptions.find((p) => p.id === id);
    if (!rx) return;

    rx.taken = rx.taken || {};
    rx.taken[today] = !rx.taken[today];

    writeStorage(STORAGE_KEYS.prescriptions, prescriptions);
    renderDashboard();
  }

  function requestRefill(id) {
    const prescriptions = readStorage(STORAGE_KEYS.prescriptions, []);
    const idx = prescriptions.findIndex((p) => p.id === id);
    if (idx === -1) return;

    const next = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
    prescriptions[idx].refillDate = next;
    writeStorage(STORAGE_KEYS.prescriptions, prescriptions);

    const { addAgentMessage } = window.PharmaCare;
    if (typeof addAgentMessage === 'function') {
      addAgentMessage(
        `Refill requested for ${prescriptions[idx].name}. Your next refill date is ${formatDate(
          next,
        )}.`,
      );
    }

    renderDashboard();
  }

  function snoozeRefill(id) {
    const prescriptions = readStorage(STORAGE_KEYS.prescriptions, []);
    const idx = prescriptions.findIndex((p) => p.id === id);
    if (idx === -1) return;

    const next = new Date(
      new Date(prescriptions[idx].refillDate).getTime() + 1000 * 60 * 60 * 24,
    ).toISOString();
    prescriptions[idx].refillDate = next;
    writeStorage(STORAGE_KEYS.prescriptions, prescriptions);
    renderDashboard();
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

    const today = dateKey(new Date());

    prescriptions.forEach((p) => {
      const days = daysUntil(p.refillDate);
      const takenToday = p.taken?.[today];

      const wrap = document.createElement('article');
      wrap.className = 'card';
      wrap.innerHTML = `
        <h3>${p.name}</h3>
        <div class="meta">Dosage: ${p.dosage}</div>

        <label style="display:flex; gap:8px; align-items:center; margin:10px 0;">
          <input type="checkbox" data-taken="${p.id}" ${takenToday ? 'checked' : ''} />
          Taken today
        </label>

        <div class="pill ${days <= 0 ? 'danger' : days <= 3 ? 'warn' : ''}">
          ${countdownText(days)}
        </div>
        <div class="meta">Refill date: ${formatDate(p.refillDate)}</div>

        <div class="actions">
          <button class="btn primary" data-refill="${p.id}">Request Refill</button>
          <button class="btn" data-snooze="${p.id}">Snooze 1 day</button>
          <button class="btn" data-delete="${p.id}">Delete</button>
        </div>
      `;

      listEl.appendChild(wrap);
    });

    listEl.onclick = (e) => {
  const taken = e.target.closest('[data-taken]');
  if (taken) toggleTaken(taken.dataset.taken);

  const refill = e.target.closest('[data-refill]');
  if (refill) requestRefill(refill.dataset.refill);

  const snooze = e.target.closest('[data-snooze]');
  if (snooze) snoozeRefill(snooze.dataset.snooze);

  const del = e.target.closest('[data-delete]');
  if (del) {
    const prescriptions = readStorage(STORAGE_KEYS.prescriptions, []);
    const updated = prescriptions.filter((p) => p.id !== del.dataset.delete);
    writeStorage(STORAGE_KEYS.prescriptions, updated);
    renderDashboard();
  }
};

  window.PharmaCare.renderDashboard = renderDashboard;
})();
