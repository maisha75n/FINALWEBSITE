(function () {
    const {
      STORAGE_KEYS,
      qs,
      readStorage,
      writeStorage,
      clamp,
      generateId,
    } = window.PharmaCare;
  
    function renderChat() {
      const list = readStorage(STORAGE_KEYS.chat, []);
      const wrap = qs('#chatMessages');
      if (!wrap) return;
      wrap.innerHTML = '';
      list.forEach((m) => {
        const div = document.createElement('div');
        div.className = `bubble ${m.from}`;
        div.textContent = m.text;
        wrap.appendChild(div);
      });
      wrap.scrollTop = wrap.scrollHeight;
    }
  
    function addUserMessage(text) {
      const list = readStorage(STORAGE_KEYS.chat, []);
      list.push({ id: generateId('msg'), from: 'user', text });
      writeStorage(STORAGE_KEYS.chat, list);
      renderChat();
    }
  
    function addAgentMessage(text) {
      const list = readStorage(STORAGE_KEYS.chat, []);
      list.push({ id: generateId('msg'), from: 'agent', text });
      writeStorage(STORAGE_KEYS.chat, list);
      const sec = document.getElementById('section-chat');
      if (sec && !sec.hasAttribute('hidden')) {
        renderChat();
      }
    }
  
    function autoRespond(input) {
      const txt = input.toLowerCase();
      let reply = "I'm here to help. Could you share more details?";
      if (/(refill|renew)/.test(txt))
        reply =
          'To request a refill, tap the "Request Refill" button on the Dashboard. I can also remind you as the date approaches.';
      else if (/(hour|open)/.test(txt))
        reply =
          'Many pharmacies open 8am–9pm; some are 24/7. Check the Pharmacies tab for local hours.';
      else if (/(insurance|cover|copay)/.test(txt))
        reply =
          'Insurance coverage varies. Please contact your pharmacy or provider to confirm your copay.';
      else if (/(hello|hi|hey)/.test(txt))
        reply = 'Hello! How can I assist with your prescriptions today?';
      else if (/(contact|phone|call)/.test(txt))
        reply =
          'Select a pharmacy from the list to view contact options, including a call button.';
      else if (/(side effect|reaction)/.test(txt))
        reply =
          'For urgent concerns, contact your pharmacist or healthcare provider. In emergencies, call local emergency services.';
      addAgentMessage(reply);
    }
  
    function initChat() {
      const form = qs('#chatForm');
      const input = qs('#chatText');
      if (!form || !input) return;
  
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        addUserMessage(text);
        input.value = '';
        setTimeout(() => autoRespond(text), clamp(text.length * 30, 300, 1200));
      });
    }
  
    window.PharmaCare.renderChat = renderChat;
    window.PharmaCare.initChat = initChat;
    window.PharmaCare.addAgentMessage = addAgentMessage;
  })();
  