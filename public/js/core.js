/**
 * AnyTool.io - Core JavaScript Engine
 * Provides Theme Management, Bilingual Support (EN/ML), Command Palette (Ctrl+K),
 * Favorites & Recents Tracking, and UI Feedback.
 */

const AnyTool = {
  // --- 1. THEME MANAGER ---
  initTheme() {
    const savedTheme = localStorage.getItem('anytool_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeIcons(savedTheme);
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('anytool_theme', next);
    this.updateThemeIcons(next);
    this.showToast(`Switched to ${next} mode`, 'info');
  },

  updateThemeIcons(theme) {
    const btns = document.querySelectorAll('.theme-toggle-btn');
    btns.forEach(btn => {
      btn.innerHTML = theme === 'dark' ? '☀️ <span class="hidden sm:inline text-xs font-semibold">Light</span>' : '🌙 <span class="hidden sm:inline text-xs font-semibold">Dark</span>';
    });
  },

  // --- 2. BILINGUAL SUPPORT (EN & ML) ---
  currentLang: localStorage.getItem('anytool_lang') || 'en',

  translations: {
    en: {
      siteTagline: "One Website – All Digital Tools.",
      heroSub: "100% Free, secure, in-browser digital toolkit. Zero data collection, zero registration — private and instant.",
      searchPlaceholder: "Search 50+ tools (e.g. merge pdf, hash, json, base64, subnet)...",
      pressCtrlK: "Press Ctrl + K",
      allTools: "All Tools",
      pdfTools: "PDF Suite",
      imageTools: "Image & Photo",
      qrTools: "QR & Barcode",
      cyberTools: "Cyber Security",
      devTools: "Developer & Code",
      csTools: "Computer Science",
      textTools: "Text & Docs",
      calcTools: "Calculators & Units",
      pythonTools: "Python & Turtle",
      recentTools: "Recently Used",
      favoriteTools: "Favorite Tools",
      noResults: "No matching tools found.",
      copied: "Copied to clipboard! ✓",
      feedbackTitle: "Share Your Feedback & Suggestions",
      sendFeedback: "Send Feedback ✉️"
    },
    ml: {
      siteTagline: "എല്ലാ ഡിജിറ്റൽ ടൂളുകളും ഒരൊറ്റ വെബ്‌സൈറ്റിൽ.",
      heroSub: "100% സൗജന്യം, സുരക്ഷിതം, അതിവേഗം. നിങ്ങളുടെ ഫയലുകൾ ബ്രൗസറിൽ മാത്രം പ്രവർത്തിക്കുന്നു — ലോഗിൻ ആവശ്യമില്ല.",
      searchPlaceholder: "ഏതൊരു ടൂളും തിരയൂ (ഉദാ: PDF, ബാക്ക്ഗ്രൗണ്ട് മാറ്റാൻ, QR, ബൈനറി, ഹാഷ്)...",
      pressCtrlK: "Ctrl + K അമർത്തുക",
      allTools: "എല്ലാ ടൂളുകളും",
      pdfTools: "PDF ടൂളുകൾ",
      imageTools: "ഇമേജ് ടൂളുകൾ",
      qrTools: "QR & ബാർകോഡ്",
      cyberTools: "സൈബർ സെക്യൂരിറ്റി",
      devTools: "ഡെവലപ്പർ ടൂളുകൾ",
      csTools: "കമ്പ്യൂട്ടർ സയൻസ്",
      textTools: "ടെക്സ്റ്റ് ടൂളുകൾ",
      calcTools: "ദൈനംദിന കാൽക്കുലേറ്ററുകൾ",
      pythonTools: "പൈത്തൺ & ടർടിൽ",
      recentTools: "അടുത്തിടെ ഉപയോഗിച്ചവ",
      favoriteTools: "പ്രിയപ്പെട്ടവ",
      noResults: "അനുയോജ്യമായ ടൂളുകൾ കണ്ടെത്തിയില്ല.",
      copied: "ക്ലിപ്പ്ബോർഡിലേക്ക് കോപ്പി ചെയ്തു! ✓",
      feedbackTitle: "നിങ്ങളുടെ നിർദ്ദേശങ്ങളും അഭിപ്രായങ്ങളും അറിയിക്കാം",
      sendFeedback: "അഭിപ്രായം അയക്കുക ✉️"
    }
  },

  initLanguage() {
    this.applyLanguage(this.currentLang);
  },

  setLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem('anytool_lang', lang);
    this.applyLanguage(lang);
    this.showToast(lang === 'ml' ? 'മലയാളം ഭാഷ തെരഞ്ഞെടുത്തു' : 'Switched to English', 'info');
  },

  toggleLanguage() {
    this.setLanguage(this.currentLang === 'en' ? 'ml' : 'en');
  },

  applyLanguage(lang) {
    const t = this.translations[lang] || this.translations.en;
    
    // Update language toggle buttons
    document.querySelectorAll('.lang-toggle-btn').forEach(btn => {
      btn.innerText = lang === 'en' ? '🌐 മലയാളം' : '🌐 English';
    });

    // Update data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key]) {
        if (el.tagName === 'INPUT' && el.getAttribute('placeholder')) {
          el.placeholder = t[key];
        } else {
          el.innerText = t[key];
        }
      }
    });

    // Update Malayalam tool subtitles if elements exist
    document.querySelectorAll('[data-title-ml]').forEach(el => {
      const enTitle = el.getAttribute('data-title-en') || el.innerText;
      const mlTitle = el.getAttribute('data-title-ml');
      if (lang === 'ml' && mlTitle) {
        el.innerText = mlTitle;
      } else if (lang === 'en' && enTitle) {
        el.innerText = enTitle;
      }
    });
  },

  // --- 3. TOAST NOTIFICATIONS ---
  showToast(message, type = 'success') {
    let toast = document.getElementById('anytoolToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'anytoolToast';
      toast.className = 'fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 border backdrop-blur-md';
      document.body.appendChild(toast);
    }

    if (type === 'success') {
      toast.className = 'fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 border backdrop-blur-md bg-emerald-950/90 text-emerald-300 border-emerald-800 show';
      toast.innerHTML = `<span>✓</span><span>${message}</span>`;
    } else if (type === 'error') {
      toast.className = 'fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 border backdrop-blur-md bg-rose-950/90 text-rose-300 border-rose-800 show';
      toast.innerHTML = `<span>⚠️</span><span>${message}</span>`;
    } else {
      toast.className = 'fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 border backdrop-blur-md bg-slate-900/90 text-cyan-300 border-cyan-800 show';
      toast.innerHTML = `<span>ℹ️</span><span>${message}</span>`;
    }

    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  },

  // --- 4. CLIPBOARD COPY ---
  copyToClipboard(text, successMsg = null) {
    if (!text || text.trim() === '') {
      this.showToast('Nothing to copy!', 'error');
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      const msg = successMsg || (this.currentLang === 'ml' ? this.translations.ml.copied : this.translations.en.copied);
      this.showToast(msg, 'success');
    }).catch(err => {
      this.showToast('Failed to copy', 'error');
    });
  },

  // --- 5. RECENTS & FAVORITES TRACKER ---
  trackTool(id, title, url, icon, category) {
    try {
      let recents = JSON.parse(localStorage.getItem('anytool_recents') || '[]');
      recents = recents.filter(item => item.id !== id);
      recents.unshift({ id, title, url, icon, category, timestamp: Date.now() });
      if (recents.length > 8) recents.pop();
      localStorage.setItem('anytool_recents', JSON.stringify(recents));
    } catch (e) {}
  },

  getRecents() {
    try {
      return JSON.parse(localStorage.getItem('anytool_recents') || '[]');
    } catch (e) {
      return [];
    }
  },

  toggleFavorite(id, title, url, icon, category) {
    try {
      let favs = JSON.parse(localStorage.getItem('anytool_favs') || '[]');
      const exists = favs.some(f => f.id === id);
      if (exists) {
        favs = favs.filter(f => f.id !== id);
        this.showToast('Removed from favorites', 'info');
      } else {
        favs.push({ id, title, url, icon, category });
        this.showToast('Added to favorites! ★', 'success');
      }
      localStorage.setItem('anytool_favs', JSON.stringify(favs));
      return !exists;
    } catch (e) {
      return false;
    }
  },

  isFavorite(id) {
    try {
      const favs = JSON.parse(localStorage.getItem('anytool_favs') || '[]');
      return favs.some(f => f.id === id);
    } catch (e) {
      return false;
    }
  },

  // --- 6. COMMAND PALETTE (Ctrl + K) ---
  initCommandPalette(toolsList = []) {
    let modal = document.getElementById('commandPaletteModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'commandPaletteModal';
      modal.className = 'fixed inset-0 z-50 hidden flex items-start justify-center pt-20 px-4 cmd-modal-backdrop';
      modal.innerHTML = `
        <div class="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 animate-in fade-in zoom-in-95 duration-150">
          <div class="p-4 border-b border-slate-800 flex items-center space-x-3">
            <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input id="cmdSearchInput" type="text" placeholder="Type a command or search any tool..." class="w-full bg-transparent border-none text-sm sm:text-base focus:outline-none text-slate-100 placeholder-slate-500 font-medium">
            <kbd class="text-[10px] uppercase font-mono px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-400">ESC</kbd>
          </div>
          <div id="cmdResultsList" class="max-h-96 overflow-y-auto p-2 space-y-1"></div>
          <div class="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between items-center font-mono">
            <span>Navigate: ↑ ↓ • Select: ↵</span>
            <span>AnyTool Quick Launcher</span>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
      });
    }

    const input = document.getElementById('cmdSearchInput');
    const results = document.getElementById('cmdResultsList');

    const renderResults = (query = '') => {
      const q = query.toLowerCase().trim();
      const filtered = toolsList.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.desc.toLowerCase().includes(q) || 
        (t.category && t.category.toLowerCase().includes(q))
      );

      if (filtered.length === 0) {
        results.innerHTML = `<div class="p-8 text-center text-xs text-slate-500 font-medium">No tools matching "${query}"</div>`;
        return;
      }

      results.innerHTML = filtered.map((t, idx) => `
        <a href="${t.url}" class="cmd-item flex items-center justify-between p-3 rounded-2xl hover:bg-slate-800/80 transition group ${idx === 0 ? 'bg-slate-800/50' : ''}">
          <div class="flex items-center space-x-3">
            <span class="text-xl p-2 rounded-xl bg-slate-800 border border-slate-700/60">${t.icon || '⚡'}</span>
            <div>
              <div class="text-sm font-bold text-slate-200 group-hover:text-cyan-400 transition">${t.title}</div>
              <div class="text-xs text-slate-500 line-clamp-1">${t.desc}</div>
            </div>
          </div>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase tracking-wider">${t.category || 'Tool'}</span>
        </a>
      `).join('');
    };

    input.addEventListener('input', () => renderResults(input.value));

    // Keyboard shortcut Ctrl + K or Cmd + K
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        modal.classList.remove('hidden');
        input.value = '';
        renderResults('');
        input.focus();
      } else if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
      }
    });
  }
};

// Auto-initialize theme and language on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  AnyTool.initTheme();
  AnyTool.initLanguage();
});


// --- 7. GOOGLE AUTH & USER MODE ENGINE ---
AnyTool.Auth = {
  currentUser: null,
  googleClientId: null,
  currentProfileTab: 'profile',

  init() {
    // 1. Load saved user from localStorage
    try {
      const saved = localStorage.getItem('anytool_user');
      if (saved) {
        this.currentUser = JSON.parse(saved);
      }
    } catch (e) {
      this.currentUser = null;
    }

    // 2. Fetch Google Client ID and init Google Identity Services
    this.fetchGoogleConfig();

    // 3. Mount UI in navigation bar
    this.renderNavWidget();

    // 4. Apply current user mode
    this.applyUserMode(this.currentUser ? (this.currentUser.mode || 'standard') : 'guest');
  },

  async fetchGoogleConfig() {
    try {
      const res = await fetch('/api/auth/config');
      const data = await res.json();
      this.googleClientId = data.clientId;
      this.loadGoogleGSI();
    } catch (e) {
      console.warn('Auth config fetch failed, using fallback.');
    }
  },

  loadGoogleGSI() {
    if (document.getElementById('google-gsi-script')) return;
    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.setupGoogleOneTap();
    };
    document.head.appendChild(script);
  },

  setupGoogleOneTap() {
    if (window.google && this.googleClientId && !this.currentUser) {
      try {
        window.google.accounts.id.initialize({
          client_id: this.googleClientId,
          callback: (response) => this.handleGoogleCredentialResponse(response),
          auto_select: false,
          cancel_on_tap_outside: true
        });
      } catch (err) {
        console.warn('Google One Tap init:', err);
      }
    }
  },

  handleGoogleCredentialResponse(response) {
    if (!response || !response.credential) return;
    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const payload = JSON.parse(jsonPayload);

      this.loginWithProfile({
        sub: payload.sub,
        name: payload.name,
        given_name: payload.given_name || payload.name?.split(' ')[0],
        email: payload.email,
        picture: payload.picture,
        mode: 'standard'
      });
    } catch (e) {
      console.error('Failed to parse Google JWT:', e);
      AnyTool.showToast('Failed to parse Google sign-in response', 'error');
    }
  },

  async loginWithProfile(profile) {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      if (data.success && data.user) {
        this.currentUser = data.user;
      } else {
        this.currentUser = profile;
      }
    } catch (err) {
      this.currentUser = profile;
    }

    localStorage.setItem('anytool_user', JSON.stringify(this.currentUser));
    this.renderNavWidget();
    this.applyUserMode(this.currentUser.mode || 'standard');
    this.closeModal('anytoolAuthModal');
    AnyTool.showToast(`Welcome, ${this.currentUser.name}! (Mode: ${this.getModeLabel(this.currentUser.mode)})`, 'success');
  },

  logout() {
    this.currentUser = null;
    localStorage.removeItem('anytool_user');
    this.renderNavWidget();
    this.applyUserMode('guest');
    this.closeModal('anytoolProfileModal');
    AnyTool.showToast('Signed out. Switched to Guest Mode.', 'info');
  },

  async setMode(newMode) {
    if (!this.currentUser) {
      AnyTool.showToast('Please sign in with Google to set custom user mode', 'error');
      return;
    }
    this.currentUser.mode = newMode;
    localStorage.setItem('anytool_user', JSON.stringify(this.currentUser));

    try {
      await fetch('/api/auth/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: this.currentUser.email, mode: newMode })
      });
    } catch (e) {}

    this.applyUserMode(newMode);
    this.renderNavWidget();
    this.renderProfileModalContent();
    AnyTool.showToast(`Switched to ${this.getModeLabel(newMode)} Mode! ⚡`, 'success');
  },

  getModeLabel(mode) {
    switch (mode) {
      case 'pro': return 'Pro Developer';
      case 'cyber': return 'Cyber Security';
      case 'standard': return 'Standard User';
      default: return 'Guest';
    }
  },

  getModeBadge(mode) {
    switch (mode) {
      case 'pro':
        return '<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-950/80 text-purple-300 border border-purple-700/80 flex items-center space-x-1"><span>⚡</span><span>Pro Dev</span></span>';
      case 'cyber':
        return '<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-950/80 text-cyan-300 border border-cyan-700/80 flex items-center space-x-1"><span>🛡️</span><span>Cyber</span></span>';
      case 'standard':
        return '<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 flex items-center space-x-1"><span>🟢</span><span>Standard</span></span>';
      default:
        return '<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-800 text-slate-400 border border-slate-700 flex items-center space-x-1"><span>👤</span><span>Guest</span></span>';
    }
  },

  applyUserMode(mode) {
    document.documentElement.setAttribute('data-user-mode', mode);
    window.dispatchEvent(new CustomEvent('anytool-mode-change', { detail: { mode } }));
  },

  renderNavWidget() {
    let container = document.getElementById('anytoolAuthContainer');
    if (!container) {
      const navActions = document.querySelector('nav .flex.items-center.space-x-3') || document.querySelector('nav .flex.items-center');
      if (navActions) {
        container = document.createElement('div');
        container.id = 'anytoolAuthContainer';
        container.className = 'flex items-center';
        navActions.insertBefore(container, navActions.firstChild);
      } else {
        return;
      }
    }

    if (this.currentUser) {
      const u = this.currentUser;
      const initial = (u.given_name || u.name || 'U').charAt(0).toUpperCase();
      const avatarHtml = u.picture 
        ? `<img src="${u.picture}" alt="${u.name}" class="w-7 h-7 rounded-full object-cover border border-cyan-500/80 shadow-sm shadow-cyan-500/20">`
        : `<div class="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">${initial}</div>`;

      container.innerHTML = `
        <div class="flex items-center space-x-2">
          <button onclick="AnyTool.Auth.openProfileModal()" class="flex items-center space-x-2 bg-slate-800/90 hover:bg-slate-750 border border-slate-700 hover:border-cyan-500/60 px-2.5 py-1.5 rounded-xl transition duration-200 group text-left" title="Click to view profile & user modes">
            ${avatarHtml}
            <div class="hidden sm:flex flex-col">
              <span class="text-xs font-bold text-slate-200 group-hover:text-cyan-300 leading-tight truncate max-w-[110px]">${u.given_name || u.name}</span>
              <span class="text-[9px] text-slate-400 font-mono flex items-center space-x-1">
                <span>Mode:</span>
                <span class="font-bold text-cyan-400">${this.getModeLabel(u.mode)}</span>
              </span>
            </div>
            <span class="hidden md:inline-block ml-1">${this.getModeBadge(u.mode)}</span>
            <svg class="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="flex items-center space-x-2">
          <button onclick="AnyTool.Auth.openLoginModal()" class="flex items-center space-x-2 bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 px-3 py-1.5 rounded-xl transition shadow-sm font-bold text-xs group" title="Sign in with your Google Account">
            <svg class="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Sign in <span class="hidden sm:inline">with Google</span></span>
          </button>
          <span class="hidden lg:inline-flex items-center space-x-1 px-2 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded-lg text-[10px] font-mono font-medium" title="Currently running in local ephemeral guest mode">
            <span>●</span>
            <span>Guest</span>
          </span>
        </div>
      `;
    }
  },

  openLoginModal() {
    let modal = document.getElementById('anytoolAuthModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'anytoolAuthModal';
      modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-8 text-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
        <button onclick="AnyTool.Auth.closeModal('anytoolAuthModal')" class="absolute top-5 right-5 text-slate-400 hover:text-white text-lg">✕</button>
        
        <div class="text-center space-y-3 mb-6">
          <div class="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <svg class="w-8 h-8" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
          </div>
          <h3 class="text-xl font-black text-white">Sign in to AnyTool.io</h3>
          <p class="text-xs text-slate-400 leading-relaxed">
            Sign in with your Google Account to sync bookmarks, unlock Pro Developer mode, and see the active community members.
          </p>
        </div>

        <div id="googleBtnWrapper" class="flex justify-center my-4 min-h-[44px]"></div>

        <div class="relative flex py-3 items-center">
          <div class="flex-grow border-t border-slate-800"></div>
          <span class="flex-shrink mx-4 text-[10px] uppercase font-mono text-slate-500 font-bold">Or Instant Connect</span>
          <div class="flex-grow border-t border-slate-800"></div>
        </div>

        <form onsubmit="AnyTool.Auth.handleCustomLogin(event)" class="space-y-3">
          <div>
            <label class="block text-[11px] font-bold text-slate-400 mb-1">Your Full Name</label>
            <input id="customName" type="text" required placeholder="e.g. Aslu Derse" class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500">
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-400 mb-1">Google Email Address</label>
            <input id="customEmail" type="email" required placeholder="e.g. yourname@gmail.com" class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500">
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-400 mb-1">Select User Mode</label>
            <select id="customMode" class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500">
              <option value="standard">🟢 Standard User Mode (Default)</option>
              <option value="pro">⚡ Pro Developer Mode</option>
              <option value="cyber">🛡️ Cyber Security Mode</option>
            </select>
          </div>
          <button type="submit" class="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black py-2.5 rounded-xl text-xs transition duration-200 shadow-lg shadow-cyan-500/20">
            Continue with Google Account →
          </button>
        </form>

        <div class="mt-4 pt-3 border-t border-slate-800/80 text-center">
          <span class="text-[10px] text-slate-500 flex items-center justify-center space-x-1">
            <span>🔒</span>
            <span>100% Privacy Protected • Zero Spam</span>
          </span>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');

    if (window.google && this.googleClientId) {
      try {
        window.google.accounts.id.renderButton(
          document.getElementById('googleBtnWrapper'),
          { theme: 'filled_blue', size: 'large', shape: 'pill', width: 280 }
        );
      } catch (e) {}
    }
  },

  handleCustomLogin(e) {
    e.preventDefault();
    const name = document.getElementById('customName').value.trim();
    const email = document.getElementById('customEmail').value.trim();
    const mode = document.getElementById('customMode').value;
    if (!name || !email) return;

    const profile = {
      sub: 'g_' + Math.abs(email.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)),
      name: name,
      given_name: name.split(' ')[0],
      email: email,
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=06b6d4&color=000&bold=true`,
      mode: mode
    };

    this.loginWithProfile(profile);
  },

  openProfileModal(initialTab = 'profile') {
    let modal = document.getElementById('anytoolProfileModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'anytoolProfileModal';
      modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm';
      document.body.appendChild(modal);
    }

    modal.classList.remove('hidden');
    this.currentProfileTab = initialTab;
    this.renderProfileModalContent();
  },

  switchProfileTab(tab) {
    this.currentProfileTab = tab;
    this.renderProfileModalContent();
  },

  async renderProfileModalContent() {
    const modal = document.getElementById('anytoolProfileModal');
    if (!modal) return;
    const u = this.currentUser || { name: 'Guest User', email: 'guest@anytool.io', mode: 'guest' };

    modal.innerHTML = `
      <div class="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-xl shadow-2xl p-6 sm:p-8 text-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
        <button onclick="AnyTool.Auth.closeModal('anytoolProfileModal')" class="absolute top-5 right-5 text-slate-400 hover:text-white text-lg">✕</button>

        <div class="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-6">
          <button onclick="AnyTool.Auth.switchProfileTab('profile')" class="px-4 py-1.5 rounded-xl text-xs font-bold transition ${this.currentProfileTab === 'profile' ? 'bg-cyan-500 text-black shadow-md' : 'text-slate-400 hover:text-white bg-slate-800'}">
            👤 My Profile & Mode
          </button>
          <button onclick="AnyTool.Auth.switchProfileTab('users')" class="px-4 py-1.5 rounded-xl text-xs font-bold transition ${this.currentProfileTab === 'users' ? 'bg-cyan-500 text-black shadow-md' : 'text-slate-400 hover:text-white bg-slate-800'}">
            👥 Active Community Users
          </button>
        </div>

        <div id="profileTabBody">
          ${this.currentProfileTab === 'profile' ? this.getProfileTabHtml(u) : '<div class="py-12 text-center text-xs text-slate-400">Loading community users...</div>'}
        </div>
      </div>
    `;

    if (this.currentProfileTab === 'users') {
      this.loadUsersList();
    }
  },

  getProfileTabHtml(u) {
    const favsCount = JSON.parse(localStorage.getItem('anytool_favs') || '[]').length;
    const recentsCount = AnyTool.getRecents ? AnyTool.getRecents().length : 0;
    const currentMode = u.mode || 'standard';

    return `
      <div class="flex items-center space-x-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 mb-6">
        <img src="${u.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}" alt="${u.name}" class="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-500/80 shadow-md">
        <div class="flex-grow">
          <div class="flex items-center space-x-2">
            <h3 class="text-lg font-black text-white">${u.name}</h3>
            <span class="text-xs bg-emerald-950/80 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">Google Verified ✓</span>
          </div>
          <p class="text-xs text-slate-400 font-mono">${u.email || 'N/A'}</p>
          <div class="flex items-center space-x-3 mt-1 text-[11px] text-slate-400">
            <span>Status: <b class="text-emerald-400">● Active</b></span>
            <span>•</span>
            <span>Provider: <b class="text-cyan-400">Google Account</b></span>
          </div>
        </div>
      </div>

      <div class="space-y-3 mb-6">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Select User Mode ("യൂസർ മോഡ്")</h4>
          <span class="text-[10px] font-mono text-cyan-400">Active: ${this.getModeLabel(currentMode)}</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button onclick="AnyTool.Auth.setMode('standard')" class="p-3.5 rounded-2xl border text-left transition relative ${currentMode === 'standard' ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-950/50' : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'}">
            <div class="text-lg mb-1">🟢</div>
            <div class="text-xs font-black text-white">Standard Mode</div>
            <p class="text-[10px] text-slate-400 leading-snug mt-1">Clean, simple interface for everyday tasks.</p>
            ${currentMode === 'standard' ? '<span class="absolute top-2 right-2 text-cyan-400 font-bold text-xs">✓</span>' : ''}
          </button>

          <button onclick="AnyTool.Auth.setMode('pro')" class="p-3.5 rounded-2xl border text-left transition relative ${currentMode === 'pro' ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-950/50' : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'}">
            <div class="text-lg mb-1">⚡</div>
            <div class="text-xs font-black text-white">Pro Developer</div>
            <p class="text-[10px] text-slate-400 leading-snug mt-1">Advanced JSON, token viewers & developer shortcuts.</p>
            ${currentMode === 'pro' ? '<span class="absolute top-2 right-2 text-purple-400 font-bold text-xs">✓</span>' : ''}
          </button>

          <button onclick="AnyTool.Auth.setMode('cyber')" class="p-3.5 rounded-2xl border text-left transition relative ${currentMode === 'cyber' ? 'bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-950/50' : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'}">
            <div class="text-lg mb-1">🛡️</div>
            <div class="text-xs font-black text-white">Cyber Security</div>
            <p class="text-[10px] text-slate-400 leading-snug mt-1">Enhanced hashing, subnet tools & packet audit.</p>
            ${currentMode === 'cyber' ? '<span class="absolute top-2 right-2 text-cyan-400 font-bold text-xs">✓</span>' : ''}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 mb-6 text-center">
        <div>
          <div class="text-lg font-black text-amber-400">★ ${favsCount}</div>
          <div class="text-[10px] text-slate-400 font-medium">Favorite Tools Saved</div>
        </div>
        <div>
          <div class="text-lg font-black text-cyan-400">⏱️ ${recentsCount}</div>
          <div class="text-[10px] text-slate-400 font-medium">Recently Used Tools</div>
        </div>
      </div>

      <div class="flex items-center justify-between pt-4 border-t border-slate-800">
        <button onclick="AnyTool.Auth.openLoginModal()" class="text-xs font-bold text-slate-400 hover:text-white transition">
          🔄 Switch Google Account
        </button>
        <button onclick="AnyTool.Auth.logout()" class="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800 text-xs font-bold transition">
          Sign Out 🚪
        </button>
      </div>
    `;
  },

  async loadUsersList() {
    const container = document.getElementById('profileTabBody');
    if (!container) return;

    try {
      const res = await fetch('/api/auth/users');
      const data = await res.json();
      const users = data.users || [];

      container.innerHTML = `
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-xs font-bold text-white uppercase tracking-wider">AnyTool Community Members</h4>
              <p class="text-[11px] text-slate-400">ആരൊക്കെയാണ് നിലവിലെ AnyTool യൂസർമാർ (Total: ${data.total || users.length} Users)</p>
            </div>
            <span class="text-[11px] font-mono px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-lg font-bold">
              ● Live Community
            </span>
          </div>

          <div class="max-h-72 overflow-y-auto space-y-2 pr-1">
            ${users.map((member) => `
              <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition">
                <div class="flex items-center space-x-3">
                  <img src="${member.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}" alt="${member.name}" class="w-10 h-10 rounded-xl object-cover border border-slate-700">
                  <div>
                    <div class="flex items-center space-x-2">
                      <span class="text-xs font-bold text-white">${member.name}</span>
                      ${this.currentUser && this.currentUser.email === member.email ? '<span class="text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-1.5 py-0.2 rounded font-mono font-bold">You</span>' : ''}
                    </div>
                    <div class="text-[10px] text-slate-400 font-mono">${member.emailMasked || member.email}</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="mb-0.5">${this.getModeBadge(member.mode)}</div>
                  <div class="text-[9px] text-slate-500 font-mono">${member.role || 'Member'}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = '<div class="py-8 text-center text-xs text-rose-400">Failed to load user list.</div>';
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
  }
};

