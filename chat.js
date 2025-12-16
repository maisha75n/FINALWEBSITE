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
      div.className = `bubble ${m.from}`; // KEEP THIS
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

  // NEW: backend call (replaces autoRespond)
  async function sendToBackend(message) {
    try {
      const res = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      return data.reply;
    } catch (err) {
      return "Sorry — I'm having trouble reaching the server right now.";
    }
  }

  function initChat() {
    const form = qs('#chatForm');
    const input = qs('#chatText');
    if (!form || !input) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;

      addUserMessage(text);
      input.value = '';

      // same delay logic you had, but backend-powered
      const delay = clamp(text.length * 30, 300, 1200);
      setTimeout(async () => {
        const reply = await sendToBackend(text);
        addAgentMessage(reply);
      }, delay);
    });
  }

  window.PharmaCare.renderChat = renderChat;
  window.PharmaCare.initChat = initChat;
  window.PharmaCare.addAgentMessage = addAgentMessage;
})();
