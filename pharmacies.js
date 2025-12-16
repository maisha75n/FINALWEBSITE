(function () {
  const { STORAGE_KEYS, qs, readStorage, writeStorage } = window.PharmaCare;

  const SAMPLE_PHARMACIES = [
    {
      id: 'ph1',
      name: 'CVS Pharmacy',
      phone: '(212) 555-0101',
      address: '123 W 42nd St, New York, NY',
      hours: '8am–9pm',
      rating: 4.7,
    },
    {
      id: 'ph2',
      name: 'Walgreens',
      phone: '(646) 555-0145',
      address: '85 Broad St, New York, NY',
      hours: 'Open 24/7',
      rating: 4.4,
    },
    {
      id: 'ph3',
      name: 'Duane Reade',
      phone: '(212) 555-0199',
      address: '210 Spring St, New York, NY',
      hours: '9am–8pm',
      rating: 4.6,
    },
    {
      id: 'ph4',
      name: 'Rite Aid',
      phone: '(718) 555-0166',
      address: '44 Court St, Brooklyn, NY',
      hours: '7am–10pm',
      rating: 4.3,
    },
  ];

  function setMap(query) {
    const frame = qs('#mapFrame');
    if (!frame) return;
    frame.src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  }

  function showPharmacyDetails(ph) {
    // 🔹 clicking pharmacy opens Google Maps (NEW TAB)
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        ph.name + ' ' + ph.address,
      )}`,
      '_blank',
    );
  }

  function initZipSearch() {
    const form = qs('#zipSearchForm');
    const input = qs('#zipInput');
    const err = qs('#zipError');
    if (!form || !input) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      err.textContent = '';

      const zip = input.value.trim();
      if (!/^\d{5}$/.test(zip)) {
        err.textContent = 'Please enter a valid 5-digit ZIP code.';
        return;
      }

      const profile = readStorage(STORAGE_KEYS.profile, {});
      writeStorage(STORAGE_KEYS.profile, {
        ...profile,
        preferredCity: zip,
      });

      setMap(`pharmacies near ${zip}`);
    });
  }

  function renderPharmacies() {
    const listEl = qs('#pharmacy-list');
    const frame = qs('#mapFrame');
    if (!listEl || !frame) return;

    // ✅ Default NYC
    const profile = readStorage(STORAGE_KEYS.profile, {});
    const location = profile.preferredCity || 'New York, NY';
    setMap(`pharmacies near ${location}`);

    listEl.innerHTML = '';
    SAMPLE_PHARMACIES.forEach((ph) => {
      const div = document.createElement('div');
      div.className = 'pharmacy-item';
      div.innerHTML = `
        <strong>${ph.name}</strong><br/>
        <span>${ph.address}</span><br/>
        <span>Rating: ${ph.rating.toFixed(1)} ★</span>
      `;
      div.addEventListener('click', () => showPharmacyDetails(ph));
      listEl.appendChild(div);
    });

    initZipSearch();
  }

  window.PharmaCare.renderPharmacies = renderPharmacies;
})();
