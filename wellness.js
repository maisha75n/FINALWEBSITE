(function () {
    const {
      STORAGE_KEYS,
      qs,
      qsa,
      readStorage,
      writeStorage,
      generateId,
      clamp,
      dateKey,
    } = window.PharmaCare;
  
    function getTodayRecord() {
      const store = readStorage(STORAGE_KEYS.wellness, {});
      const key = dateKey(new Date());
      if (!store[key]) {
        store[key] = { mood: '', water: 0, waterMax: 8, foods: [] };
        writeStorage(STORAGE_KEYS.wellness, store);
      }
      return store[key];
    }
  
    function updateTodayRecord(mutator) {
      const store = readStorage(STORAGE_KEYS.wellness, {});
      const key = dateKey(new Date());
      const rec = store[key] || { mood: '', water: 0, waterMax: 8, foods: [] };
      mutator(rec);
      store[key] = rec;
      writeStorage(STORAGE_KEYS.wellness, store);
    }
  
    function setTodayMood(mood) {
      updateTodayRecord((r) => {
        r.mood = mood;
      });
  
      const { addAgentMessage, checkAchievements } = window.PharmaCare;
      if (typeof addAgentMessage === 'function') {
        addAgentMessage(`Noted your mood today: ${mood}`);
      }
      renderWellness();
      if (typeof checkAchievements === 'function') {
        checkAchievements();
      }
    }
  
    function adjustWater(delta) {
      updateTodayRecord((r) => {
        const max = r.waterMax || 8;
        r.water = clamp((r.water || 0) + delta, 0, 24);
        r.waterMax = max;
      });
      renderWellness();
    }
  
    function addFood(text) {
      updateTodayRecord((r) => {
        r.foods = Array.isArray(r.foods) ? r.foods : [];
        r.foods.push({ id: generateId('food'), text });
      });
    }
  
    function removeFood(id) {
      updateTodayRecord((r) => {
        r.foods = (r.foods || []).filter((f) => f.id !== id);
      });
      renderWellness();
    }
  
    function getMoodColor(mood) {
      const colors = {
        '😀': 'linear-gradient(135deg, #fef08a, #fde047)',
        '🙂': 'linear-gradient(135deg, #a7f3d0, #6ee7b7)',
        '😐': 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
        '😕': 'linear-gradient(135deg, #fed7aa, #fdba74)',
        '😔': 'linear-gradient(135deg, #fecdd3, #fda4af)',
      };
      return colors[mood] || 'rgba(255, 255, 255, 0.8)';
    }
  
    function renderMoodCalendar() {
      const container = qs('#moodCalendar');
      if (!container) return;
  
      container.innerHTML = '';
      const wellness = readStorage(STORAGE_KEYS.wellness, {});
      const today = new Date();
      const todayKey = dateKey(today);
  
      for (let i = 13; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const key = dateKey(date);
        const dayRecord = wellness[key];
        const mood = dayRecord?.mood || '';
  
        const dayEl = document.createElement('div');
        dayEl.className = `mood-day ${mood ? 'has-mood' : ''}`;
        dayEl.setAttribute('data-date', key);
        dayEl.setAttribute('title', date.toLocaleDateString());
  
        if (mood) {
          dayEl.textContent = mood;
          dayEl.style.background = getMoodColor(mood);
        } else {
          dayEl.textContent = date.getDate();
          dayEl.style.fontSize = '12px';
          dayEl.style.color = 'var(--muted)';
        }
  
        if (key === todayKey) {
          dayEl.style.border = '2px solid var(--primary)';
          dayEl.style.boxShadow = '0 0 10px rgba(99, 102, 241, 0.5)';
        }
  
        container.appendChild(dayEl);
      }
    }
  
    function renderWaterChart() {
      const canvas = qs('#waterChart');
      if (!canvas || typeof Chart === 'undefined') return;
  
      const rec = getTodayRecord();
      const max = rec.waterMax || 8;
      const current = rec.water || 0;
  
      if (window.PharmaCare.waterChartInstance) {
        window.PharmaCare.waterChartInstance.destroy();
      }
  
      const ctx = canvas.getContext('2d');
      window.PharmaCare.waterChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Consumed', 'Remaining'],
          datasets: [
            {
              data: [current, Math.max(0, max - current)],
              backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(226, 232, 240, 0.5)'],
              borderColor: ['rgba(16, 185, 129, 1)', 'rgba(226, 232, 240, 1)'],
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { display: false },
          },
        },
      });
    }
  
    function renderWellness() {
      const rec = getTodayRecord();
  
      const moodEl = qs('#moodToday');
      if (moodEl) moodEl.textContent = rec.mood || '—';
  
      const buttons = qsa('.mood-btn');
      buttons.forEach((b) =>
        b.classList.toggle('is-selected', b.getAttribute('data-mood') === rec.mood),
      );
  
      const max = rec.waterMax || 8;
      const fill = qs('#waterFill');
      const countEl = qs('#waterCount');
      const maxEl = qs('#waterMax');
      const targetEl = qs('#waterTarget');
  
      if (fill) {
        const pct = clamp((rec.water / max) * 100, 0, 100);
        fill.style.width = `${pct}%`;
        fill.setAttribute('aria-valuenow', String(rec.water));
        fill.setAttribute('aria-valuemax', String(max));
      }
      if (countEl) countEl.textContent = String(rec.water || 0);
      if (maxEl) maxEl.textContent = String(max);
      if (targetEl) targetEl.textContent = String(max);
  
      const listEl = qs('#foodList');
      if (listEl) {
        listEl.innerHTML = '';
        (rec.foods || []).forEach((item) => {
          const row = document.createElement('div');
          row.className = 'food-item';
          row.innerHTML = `<span>${item.text}</span><button class="remove" data-remove-food="${item.id}">Remove</button>`;
          listEl.appendChild(row);
        });
  
        listEl.addEventListener(
          'click',
          (e) => {
            const btn = e.target.closest('[data-remove-food]');
            if (!btn) return;
            const id = btn.getAttribute('data-remove-food');
            removeFood(id);
          },
          { once: true },
        );
      }
  
      renderMoodCalendar();
      renderWaterChart();
  
      const { checkAchievements } = window.PharmaCare;
      if (typeof checkAchievements === 'function') {
        checkAchievements();
      }
    }
  
    function initWellness() {
      const moodGroup = qs('#moodChoices');
      if (moodGroup) {
        moodGroup.addEventListener('click', (e) => {
          const btn = e.target.closest('.mood-btn');
          if (!btn) return;
          const mood = btn.getAttribute('data-mood');
          setTodayMood(mood);
        });
      }
  
      const addBtn = qs('#btnAddWater');
      const remBtn = qs('#btnRemoveWater');
      if (addBtn) addBtn.addEventListener('click', () => adjustWater(1));
      if (remBtn) remBtn.addEventListener('click', () => adjustWater(-1));
  
      const foodForm = qs('#foodForm');
      if (foodForm) {
        foodForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const input = qs('#foodInput');
          const val = (input.value || '').trim();
          if (!val) return;
          addFood(val);
          input.value = '';
          renderWellness();
        });
      }
    }
  
    window.PharmaCare.getTodayRecord = getTodayRecord;
    window.PharmaCare.updateTodayRecord = updateTodayRecord;
    window.PharmaCare.renderMoodCalendar = renderMoodCalendar;
    window.PharmaCare.renderWaterChart = renderWaterChart;
    window.PharmaCare.renderWellness = renderWellness;
    window.PharmaCare.initWellness = initWellness;
  })();
  