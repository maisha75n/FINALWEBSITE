(function () {
    const {
      STORAGE_KEYS,
      qs,
      readStorage,
      writeStorage,
    } = window.PharmaCare;
  
    function showError(field, msg) {
      const el = qs(`#err-${field}`);
      if (el) el.textContent = msg;
    }
  
    function clearProfileErrors() {
      ['fullName', 'email', 'phone'].forEach((f) => showError(f, ''));
    }
  
    function renderProfile() {
      const profile = readStorage(STORAGE_KEYS.profile, {});
      const fullName = qs('#fullName');
      const email = qs('#email');
      const phone = qs('#phone');
      const preferredCity = qs('#preferredCity');
  
      if (fullName) fullName.value = profile.fullName || '';
      if (email) email.value = profile.email || '';
      if (phone) phone.value = profile.phone || '';
      if (preferredCity) preferredCity.value = profile.preferredCity || '';
    }
  
    function initProfile() {
      const form = qs('#profile-form');
      if (!form) return;
  
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        clearProfileErrors();
  
        const fullName = qs('#fullName').value.trim();
        const email = qs('#email').value.trim();
        const phone = qs('#phone').value.trim();
        const preferredCity = qs('#preferredCity').value.trim();
  
        let valid = true;
        if (!fullName) {
          showError('fullName', 'Please enter your name.');
          valid = false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          showError('email', 'Enter a valid email.');
          valid = false;
        }
        if (!/^[+\d()\-\s]{7,}$/.test(phone)) {
          showError('phone', 'Enter a valid phone number.');
          valid = false;
        }
        if (!valid) return;
  
        writeStorage(STORAGE_KEYS.profile, {
          fullName,
          email,
          phone,
          preferredCity,
        });
  
        const { addAgentMessage, renderPharmacies } = window.PharmaCare;
        if (typeof addAgentMessage === 'function') {
          addAgentMessage('Profile saved successfully.');
        }
        const sec = document.getElementById('section-pharmacies');
        if (sec && !sec.hasAttribute('hidden') && typeof renderPharmacies === 'function') {
          renderPharmacies();
        }
      });
    }
  
    window.PharmaCare.renderProfile = renderProfile;
    window.PharmaCare.initProfile = initProfile;
  })();
  