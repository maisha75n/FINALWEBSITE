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
  
    function onDashboardClick(e) {
      const refillBtn = e.target.closest('[data-refill]');
      const snoozeBtn = e.target.closest('[data-snooze]');
      if (refillBtn) {
        const id = refillBtn.getAttribute('data-refill');
        requestRefill(id);
      }
      if (snoozeBtn) {
        const id = snoozeBtn.getAttribute('data-snooze');
        snoozeRefill(id);
      }
    }
  
    function renderDashboard() {
      const listEl = qs('#prescription-list');
      const alertsEl = qs('#alerts');
      const prescriptions = readStorage(STORAGE_KEYS.prescriptions, []);
  
      const due = prescriptions.filter((p) => daysUntil(p.refillDate) <= 0);
      const soon = prescriptions.filter((p) => {
        const d = daysUntil(p.refillDate);
        return d > 0 && d <= 3;
      });
  
      alertsEl.innerHTML = '';
  
      if (due.length > 0) {
        due.slice(0, 3).forEach((p) => {
          const div = document.createElement('div');
          div.className = 'alert due';
          div.innerHTML = `⏰ Refill due now: <strong>${p.name}</strong> (${p.dosage}). <button class="btn" data-refill="${p.id}">Request Refill</button>`;
          alertsEl.appendChild(div);
        });
      }
  
      if (soon.length > 0) {
        soon.slice(0, 3).forEach((p) => {
          const days = daysUntil(p.refillDate);
          const div = document.createElement('div');
          div.className = 'alert';
          div.textContent = `Reminder: ${p.name} refill in ${days} day${
            days === 1 ? '' : 's'
          }.`;
          alertsEl.appendChild(div);
        });
      }
  
      listEl.innerHTML = '';
      if (prescriptions.length === 0) {
        listEl.innerHTML = '<p>No prescriptions yet. Add one from Upload.</p>';
        return;
      }
  
      prescriptions.forEach((p) => {
        const days = daysUntil(p.refillDate);
        const wrap = document.createElement('article');
        wrap.className = 'card';
        wrap.innerHTML = `
          <h3>${p.name}</h3>
          <div class="meta">Dosage: ${p.dosage}</div>
          <div class="pill ${
            days <= 0 ? 'danger' : days <= 3 ? 'warn' : ''
          }" data-countdown="${p.refillDate}">
            <span class="countdown">${countdownText(days)}</span>
          </div>
          <div class="meta">Refill date: ${formatDate(p.refillDate)}</div>
          <div class="actions">
            <button class="btn primary" data-refill="${p.id}">Request Refill</button>
            <button class="btn" data-snooze="${p.id}">Snooze 1 day</button>
          </div>
        `;
        listEl.appendChild(wrap);
      });
  
      listEl.addEventListener('click', onDashboardClick);
      alertsEl.addEventListener('click', onDashboardClick);
    }
  
    function startCountdownTicker() {
      function tick() {
        qsa('[data-countdown]').forEach((el) => {
          const iso = el.getAttribute('data-countdown');
          const days = daysUntil(iso);
          const cd = el.querySelector('.countdown');
          if (cd) cd.textContent = countdownText(days);
          el.classList.toggle('danger', days <= 0);
          el.classList.toggle('warn', days > 0 && days <= 3);
        });
      }
      tick();
      setInterval(tick, 60 * 1000);
    }
  
    window.PharmaCare.renderDashboard = renderDashboard;
    window.PharmaCare.startCountdownTicker = startCountdownTicker;
  })();
  