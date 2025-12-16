(function () {
    const { qsa } = window.PharmaCare;
  
    function setActiveSection(sectionId) {
      const sections = qsa('.app-main > .section');
      sections.forEach((sec) => {
        const isTarget = sec.id === `section-${sectionId}`;
        if (isTarget) {
          sec.removeAttribute('hidden');
          sec.classList.add('is-active');
        } else {
          sec.setAttribute('hidden', 'hidden');
          sec.classList.remove('is-active');
        }
      });
  
      const {
        renderDashboard,
        renderPharmacies,
        renderChat,
        renderProfile,
        renderWellness,
        renderAnalytics,
      } = window.PharmaCare;
  
      if (sectionId === 'dashboard' && typeof renderDashboard === 'function') {
        renderDashboard();
      }
      if (sectionId === 'pharmacies' && typeof renderPharmacies === 'function') {
        renderPharmacies();
      }
      if (sectionId === 'chat' && typeof renderChat === 'function') {
        renderChat();
      }
      if (sectionId === 'profile' && typeof renderProfile === 'function') {
        renderProfile();
      }
      if (sectionId === 'wellness' && typeof renderWellness === 'function') {
        renderWellness();
      }
      if (sectionId === 'analytics' && typeof renderAnalytics === 'function') {
        renderAnalytics();
      }
    }
  
    function initNav() {
      const buttons = qsa('.primary-nav .nav-btn');
      const hamburger = document.querySelector('.hamburger');
      const nav = document.querySelector('.primary-nav');
    
      buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
          buttons.forEach((b) => b.classList.remove('is-active'));
          btn.classList.add('is-active');
    
          const section = btn.getAttribute('data-section');
          setActiveSection(section);
    
          // close mobile menu after selection
          if (nav) nav.classList.remove('is-open');
          if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
        });
      });
    
      // mobile hamburger toggle
      if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
          nav.classList.toggle('is-open');
          const expanded = hamburger.getAttribute('aria-expanded') === 'true';
          hamburger.setAttribute('aria-expanded', String(!expanded));
        });
      }
    }
    
  
    window.PharmaCare.initNav = initNav;
    window.PharmaCare.setActiveSection = setActiveSection;
  })();
  