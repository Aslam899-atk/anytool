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
