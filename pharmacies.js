(function () {
    const { STORAGE_KEYS, qs, readStorage } = window.PharmaCare;
  
    const SAMPLE_PHARMACIES = [
      {
        id: 'ph1',
        name: 'Greenleaf Pharmacy',
        phone: '(617) 555-0101',
        address: '12 Beacon St, Boston, MA',
        hours: '8am–9pm',
        rating: 4.7,
      },
      {
        id: 'ph2',
        name: 'Harbor Wellness Rx',
        phone: '(617) 555-0145',
        address: '220 Seaport Blvd, Boston, MA',
        hours: 'Open 24/7',
        rating: 4.4,
      },
      {
        id: 'ph3',
        name: 'Back Bay Apothecary',
        phone: '(617) 555-0199',
        address: '800 Boylston St, Boston, MA',
        hours: '9am–8pm',
        rating: 4.6,
      },
      {
        id: 'ph4',
        name: 'Charles River Pharmacy',
        phone: '(617) 555-0166',
        address: '45 Cambridge St, Cambridge, MA',
        hours: '7am–10pm',
        rating: 4.3,
      },
    ];
  
    function showPharmacyDetails(ph) {
      const detailsEl = qs('#pharmacy-details');
      if (!detailsEl) return;
  
      detailsEl.innerHTML = `
        <h3>${ph.name}</h3>
        <p>${ph.address}</p>
        <p>Hours: ${ph.hours}</p>
        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:8px;">
          <a class="btn primary" href="tel:${ph.phone.replace(/[^\d]/g, '')}">Call ${
        ph.phone
      }</a>
          <a class="btn" target="_blank" rel="noreferrer" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            ph.name + ' ' + ph.address,
          )}">Open in Maps</a>
        </div>
      `;
    }
  
    function renderPharmacies() {
      const listEl = qs('#pharmacy-list');
      const detailsEl = qs('#pharmacy-details');
      const frame = qs('#mapFrame');
      if (!listEl || !detailsEl || !frame) return;
  
      const profile = readStorage(STORAGE_KEYS.profile, {});
      const locationQuery = encodeURIComponent(profile.preferredCity || 'Boston, MA');
      const q = `pharmacies near ${locationQuery}`;
      frame.src = `https://www.google.com/maps?q=${q}&output=embed`;
  
      listEl.innerHTML = '';
      SAMPLE_PHARMACIES.forEach((ph) => {
        const div = document.createElement('div');
        div.className = 'pharmacy-item';
        div.setAttribute('data-id', ph.id);
        div.innerHTML = `
          <strong>${ph.name}</strong><br/>
          <span>${ph.address}</span><br/>
          <span>Rating: ${ph.rating.toFixed(1)} ★</span>
        `;
        div.addEventListener('click', () => showPharmacyDetails(ph));
        listEl.appendChild(div);
      });
  
      detailsEl.innerHTML = '<em>Select a pharmacy to see details.</em>';
    }
  
    window.PharmaCare.renderPharmacies = renderPharmacies;
  })();
  