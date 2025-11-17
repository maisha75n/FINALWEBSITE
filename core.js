(function () {
    const STORAGE_KEYS = {
      prescriptions: 'pharmacare:prescriptions',
      profile: 'pharmacare:profile',
      chat: 'pharmacare:chat',
      wellness: 'pharmacare:wellness',
      metrics: 'pharmacare:metrics',
      achievements: 'pharmacare:achievements',
    };
  
    const qs = (sel, el = document) => el.querySelector(sel);
    const qsa = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  
    function readStorage(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) {
        return fallback;
      }
    }
  
    function writeStorage(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  
    function formatDate(dateLike) {
      const d = new Date(dateLike);
      if (Number.isNaN(d.getTime())) return '—';
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  
    function daysUntil(dateLike) {
      const now = new Date();
      const d = new Date(dateLike);
      const ms = d.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0);
      return Math.ceil(ms / (1000 * 60 * 60 * 24));
    }
  
    function generateId(prefix = 'id') {
      return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(
        36,
      )}`;
    }
  
    function clamp(n, min, max) {
      return Math.max(min, Math.min(max, n));
    }
  
    function dateKey(d) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
  
    function ensureSeedData() {
      const seeded = readStorage(STORAGE_KEYS.prescriptions, null);
      if (!seeded) {
        const sample = [
          {
            id: generateId('rx'),
            name: 'Atorvastatin',
            dosage: '20 mg',
            refillDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 8).toISOString(),
          },
          {
            id: generateId('rx'),
            name: 'Metformin',
            dosage: '500 mg',
            refillDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
          },
          {
            id: generateId('rx'),
            name: 'Lisinopril',
            dosage: '10 mg',
            refillDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
          },
        ];
        writeStorage(STORAGE_KEYS.prescriptions, sample);
      }
  
      const prof = readStorage(STORAGE_KEYS.profile, null);
      if (!prof) {
        writeStorage(STORAGE_KEYS.profile, {
          fullName: '',
          email: '',
          phone: '',
          preferredCity: 'Boston, MA',
        });
      }
  
      const chat = readStorage(STORAGE_KEYS.chat, null);
      if (!chat) {
        writeStorage(STORAGE_KEYS.chat, [
          {
            id: generateId('msg'),
            from: 'agent',
            text: "Hi! I'm your PharmaCare assistant. How can I help today?",
          },
        ]);
      }
  
      const wellness = readStorage(STORAGE_KEYS.wellness, null);
      if (!wellness) {
        const today = dateKey(new Date());
        writeStorage(STORAGE_KEYS.wellness, {
          [today]: { mood: '', water: 0, waterMax: 8, foods: [] },
        });
      }
  
      const metrics = readStorage(STORAGE_KEYS.metrics, null);
      if (!metrics) {
        writeStorage(STORAGE_KEYS.metrics, []);
      }
  
      const achievements = readStorage(STORAGE_KEYS.achievements, null);
      if (!achievements) {
        writeStorage(STORAGE_KEYS.achievements, []);
      }
    }
  
    function setYear() {
      const y = new Date().getFullYear();
      const el = qs('#year');
      if (el) el.textContent = String(y);
    }
  
    window.PharmaCare = Object.assign(window.PharmaCare || {}, {
      STORAGE_KEYS,
      qs,
      qsa,
      readStorage,
      writeStorage,
      formatDate,
      daysUntil,
      generateId,
      clamp,
      dateKey,
      ensureSeedData,
      setYear,
    });
  })();
  