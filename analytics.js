(function () {
    const {
      STORAGE_KEYS,
      qs,
      readStorage,
      writeStorage,
      daysUntil,
      dateKey,
    } = window.PharmaCare;
  
    function initHealthMetrics() {
      const saveBtn = qs('#saveMetrics');
      if (!saveBtn) return;
  
      saveBtn.addEventListener('click', () => {
        const metrics = {
          date: dateKey(new Date()),
          bloodPressure: qs('#bloodPressure').value || '',
          weight: parseFloat(qs('#weight').value) || null,
          steps: parseInt(qs('#steps').value, 10) || null,
          sleepHours: parseFloat(qs('#sleepHours').value) || null,
        };
        const allMetrics = readStorage(STORAGE_KEYS.metrics, []);
        allMetrics.push(metrics);
        writeStorage(STORAGE_KEYS.metrics, allMetrics);
  
        const { addAgentMessage } = window.PharmaCare;
        if (typeof addAgentMessage === 'function') {
          addAgentMessage('Health metrics saved successfully!');
        }
        renderAnalytics();
      });
    }
  
    function renderMedicationChart() {
      const canvas = qs('#medicationChart');
      if (!canvas || typeof Chart === 'undefined') return;
  
      const prescriptions = readStorage(STORAGE_KEYS.prescriptions, []);
      const ctx = canvas.getContext('2d');
  
      if (window.PharmaCare.medicationChartInstance) {
        window.PharmaCare.medicationChartInstance.destroy();
      }
  
      const labels = prescriptions.map((p) => p.name);
      const daysUntilRefill = prescriptions.map((p) =>
        Math.max(0, daysUntil(p.refillDate)),
      );
  
      window.PharmaCare.medicationChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Days Until Refill',
              data: daysUntilRefill,
              backgroundColor: [
                'rgba(99, 102, 241, 0.7)',
                'rgba(168, 85, 247, 0.7)',
                'rgba(236, 72, 153, 0.7)',
                'rgba(59, 130, 246, 0.7)',
                'rgba(16, 185, 129, 0.7)',
              ],
              borderColor: [
                'rgba(99, 102, 241, 1)',
                'rgba(168, 85, 247, 1)',
                'rgba(236, 72, 153, 1)',
                'rgba(59, 130, 246, 1)',
                'rgba(16, 185, 129, 1)',
              ],
              borderWidth: 2,
              borderRadius: 8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { display: false },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { color: '#6b7280' },
              grid: { color: 'rgba(99, 102, 241, 0.1)' },
            },
            x: {
              ticks: { color: '#6b7280' },
              grid: { display: false },
            },
          },
        },
      });
    }
  
    function renderMoodChart() {
      const canvas = qs('#moodChart');
      if (!canvas || typeof Chart === 'undefined') return;
  
      const ctx = canvas.getContext('2d');
      if (window.PharmaCare.moodChartInstance) {
        window.PharmaCare.moodChartInstance.destroy();
      }
  
      const wellness = readStorage(STORAGE_KEYS.wellness, {});
      const moodValues = { '😀': 5, '🙂': 4, '😐': 3, '😕': 2, '😔': 1 };
      const labels = [];
      const data = [];
  
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = dateKey(date);
        const record = wellness[key];
        const moodScore = record?.mood ? moodValues[record.mood] || 0 : 0;
  
        labels.push(
          date.toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }),
        );
        data.push(moodScore);
      }
  
      window.PharmaCare.moodChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Mood Score',
              data,
              borderColor: 'rgba(168, 85, 247, 1)',
              backgroundColor: 'rgba(168, 85, 247, 0.1)',
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: 'rgba(168, 85, 247, 1)',
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              pointRadius: 5,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { display: false },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 5,
              ticks: {
                stepSize: 1,
                color: '#6b7280',
                callback: (value) => {
                  const moods = ['', '😔', '😕', '😐', '🙂', '😀'];
                  return moods[value] || '';
                },
              },
              grid: { color: 'rgba(168, 85, 247, 0.1)' },
            },
            x: {
              ticks: { color: '#6b7280' },
              grid: { display: false },
            },
          },
        },
      });
    }
  
    function renderWaterWeeklyChart() {
      const canvas = qs('#waterWeeklyChart');
      if (!canvas || typeof Chart === 'undefined') return;
  
      const ctx = canvas.getContext('2d');
      if (window.PharmaCare.waterWeeklyChartInstance) {
        window.PharmaCare.waterWeeklyChartInstance.destroy();
      }
  
      const wellness = readStorage(STORAGE_KEYS.wellness, {});
      const labels = [];
      const data = [];
  
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = dateKey(date);
        const record = wellness[key];
  
        labels.push(date.toLocaleDateString(undefined, { weekday: 'short' }));
        data.push(record?.water || 0);
      }
  
      window.PharmaCare.waterWeeklyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Glasses',
              data,
              backgroundColor: 'rgba(59, 130, 246, 0.7)',
              borderColor: 'rgba(59, 130, 246, 1)',
              borderWidth: 2,
              borderRadius: 8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { display: false },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { color: '#6b7280' },
              grid: { color: 'rgba(59, 130, 246, 0.1)' },
            },
            x: {
              ticks: { color: '#6b7280' },
              grid: { display: false },
            },
          },
        },
      });
    }
  
    function renderStats() {
      const prescriptions = readStorage(STORAGE_KEYS.prescriptions, []);
      const due = prescriptions.filter((p) => daysUntil(p.refillDate) <= 3);
      const wellness = readStorage(STORAGE_KEYS.wellness, {});
  
      let waterSum = 0;
      let waterDays = 0;
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = dateKey(date);
        const rec = wellness[key];
        if (rec && rec.water) {
          waterSum += rec.water;
          waterDays++;
        }
      }
      const avgWater = waterDays > 0 ? Math.round(waterSum / waterDays) : 0;
  
      const moodValues = { '😀': 5, '🙂': 4, '😐': 3, '😕': 2, '😔': 1 };
      let moodSum = 0;
      let moodDays = 0;
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = dateKey(date);
        const rec = wellness[key];
        if (rec && rec.mood) {
          moodSum += moodValues[rec.mood] || 0;
          moodDays++;
        }
      }
      const avgMoodScore = moodDays > 0 ? Math.round(moodSum / moodDays) : 0;
      const avgMoodEmoji = ['', '😔', '😕', '😐', '🙂', '😀'][avgMoodScore] || '—';
  
      qs('#statMedications').textContent = prescriptions.length;
      qs('#statRefills').textContent = due.length;
      qs('#statWaterAvg').textContent = avgWater;
      qs('#statMoodAvg').textContent = avgMoodEmoji;
    }
  
    function renderAchievements() {
      const container = qs('#achievementsList');
      if (!container) return;
  
      const achievements = readStorage(STORAGE_KEYS.achievements, []);
      container.innerHTML = '';
  
      if (achievements.length === 0) {
        container.innerHTML =
          '<p style="color: var(--muted); text-align: center;">No achievements yet. Keep tracking your health!</p>';
        return;
      }
  
      achievements.forEach((achievement) => {
        const div = document.createElement('div');
        div.className = 'achievement-item';
        div.innerHTML = `
          <div class="achievement-icon">${achievement.icon}</div>
          <div class="achievement-text">
            <div class="achievement-title">${achievement.title}</div>
            <div class="achievement-desc">${achievement.description}</div>
          </div>
        `;
        container.appendChild(div);
      });
    }
  
    function checkAchievements() {
      const achievements = readStorage(STORAGE_KEYS.achievements, []);
      const existingIds = new Set(achievements.map((a) => a.id));
      const newAchievements = [];
  
      const prescriptions = readStorage(STORAGE_KEYS.prescriptions, []);
      const wellness = readStorage(STORAGE_KEYS.wellness, {});
  
      if (prescriptions.length >= 1 && !existingIds.has('first_rx')) {
        newAchievements.push({
          id: 'first_rx',
          icon: '💊',
          title: 'First Prescription',
          description: 'Added your first medication',
        });
      }
  
      let streak = 0;
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = dateKey(date);
        if (wellness[key] && wellness[key].mood) streak++;
      }
      if (streak >= 7 && !existingIds.has('mood_streak_7')) {
        newAchievements.push({
          id: 'mood_streak_7',
          icon: '📅',
          title: 'Mood Master',
          description: 'Tracked mood for 7 days straight',
        });
      }
  
      const todayRec = window.PharmaCare.getTodayRecord();
      if (todayRec.water >= todayRec.waterMax && !existingIds.has('water_goal')) {
        newAchievements.push({
          id: 'water_goal',
          icon: '💧',
          title: 'Hydration Hero',
          description: 'Met your daily water goal!',
        });
      }
  
      if (prescriptions.length >= 5 && !existingIds.has('rx_manager')) {
        newAchievements.push({
          id: 'rx_manager',
          icon: '🏆',
          title: 'Prescription Manager',
          description: 'Managing 5+ medications',
        });
      }
  
      if (newAchievements.length > 0) {
        const all = [...achievements, ...newAchievements];
        writeStorage(STORAGE_KEYS.achievements, all);
        const { addAgentMessage } = window.PharmaCare;
        newAchievements.forEach((ach) => {
          if (typeof addAgentMessage === 'function') {
            addAgentMessage(`🏆 Achievement unlocked: ${ach.title}! ${ach.description}`);
          }
        });
      }
    }
  
    function renderAnalytics() {
      renderMedicationChart();
      renderMoodChart();
      renderWaterWeeklyChart();
  
      if (typeof window.PharmaCare.renderWaterChart === 'function') {
        window.PharmaCare.renderWaterChart();
      }
  
      renderStats();
      renderAchievements();
      checkAchievements();
    }
  
    window.PharmaCare.initHealthMetrics = initHealthMetrics;
    window.PharmaCare.renderAnalytics = renderAnalytics;
    window.PharmaCare.checkAchievements = checkAchievements;
  })();
  