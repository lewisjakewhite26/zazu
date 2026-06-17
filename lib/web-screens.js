/**
 * Calendar + settings screens for zazu.html.
 * Depends on: ZazuCalendar, ZazuSettings, ZazuProgress, COPY (global).
 */

(function () {
  const HISTORY_DAYS = 30;
  const OLDER_PREVIEW_COUNT = 4;

  let calendarGoldPreview = false;
  let selectedCalendarEntry = null;
  let returnScreenAfterOverlay = 'screenHome';

  function cardVariantClass(variant) {
    return `cal-card-${variant}`;
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderDayIcons(entry, isGold) {
    const gym = window.ZazuCalendar.resolveGymDisplay(isGold, entry.gymCompleted, entry.completed);
    const done = entry.completed ? '✓' : '○';
    let gymIcon = '○';
    if (gym === 'done') gymIcon = '🏋️';
    else if (gym === 'locked') gymIcon = '🔒';
    else if (gym === 'open') gymIcon = '→';
    return `<span class="cal-icons" aria-hidden="true">${done} ${gymIcon}</span>`;
  }

  function renderDayCard(entry, isGold) {
    const locked = !isGold && !window.ZazuCalendar.isDayAccessibleForFree(entry.dayOffset);
    const lockedClass = locked ? ' cal-day-locked' : '';
    const onclick = locked ? '' : `onclick="window.ZazuWebScreens.openCalendarEntry(${entry.dayOffset})"`;
    return `
      <button type="button" class="cal-day-card ${cardVariantClass(entry.variant)}${lockedClass}" ${onclick} ${locked ? 'disabled' : ''}>
        <div>
          <div class="cal-day-date">${escapeHtml(entry.dateLabelShort)}</div>
          <div class="cal-day-word">${escapeHtml(entry.word.word)}</div>
        </div>
        ${renderDayIcons(entry, isGold)}
        ${locked ? '<span class="cal-lock-icon" aria-hidden="true">🔒</span>' : ''}
      </button>`;
  }

  function renderCalendar() {
    const progress = window.ZazuProgress?.readProgress() ?? {
      streak: 0,
      learnedWordIds: [],
      wordProgress: [],
    };
    const words = window.ZazuWebScreens.getAlarmWords?.() ?? [];
    const entries = window.ZazuCalendar.buildCalendarEntries(
      words,
      progress.learnedWordIds,
      progress.wordProgress,
      HISTORY_DAYS,
    );

    calendarGoldPreview = window.ZazuSettings?.readSettings()?.goldPreview ?? false;
    const wordsLearned = window.ZazuCalendar.countLearnedForTier(entries, calendarGoldPreview);
    const sub = document.getElementById('calNavSub');
    if (sub) sub.textContent = COPY.calendar.wordsLearned(wordsLearned);

    const streakEl = document.getElementById('calStreakPill');
    if (streakEl) streakEl.textContent = COPY.calendar.streakDays(progress.streak);

    document.getElementById('calToggleFree')?.classList.toggle('active', !calendarGoldPreview);
    document.getElementById('calToggleGold')?.classList.toggle('active', calendarGoldPreview);

    const todayEntry = entries[0] ?? null;
    const weekEntries = entries.filter((e) => e.dayOffset >= 1 && e.dayOffset <= 4);
    const olderEntries = entries.filter((e) => e.dayOffset >= 5);
    const olderPreview = olderEntries.slice(0, OLDER_PREVIEW_COUNT);

    window.ZazuWebScreens._calendarEntries = entries;

    const hero = document.getElementById('calHero');
    if (hero && todayEntry) {
      const gym = window.ZazuCalendar.resolveGymDisplay(
        calendarGoldPreview,
        todayEntry.gymCompleted,
        todayEntry.completed,
      );
      hero.innerHTML = `
        <button type="button" class="cal-hero-card" onclick="window.ZazuWebScreens.openCalendarEntry(0)">
          <div>
            <div class="cal-hero-badge">${COPY.calendar.today}</div>
            <div class="cal-hero-word">${escapeHtml(todayEntry.word.word)}</div>
            <div class="cal-hero-date">${escapeHtml(todayEntry.dateLabelLong)}</div>
          </div>
          ${renderDayIcons(todayEntry, calendarGoldPreview)}
        </button>`;
      hero.dataset.gym = gym;
    }

    const weekGrid = document.getElementById('calWeekGrid');
    if (weekGrid) {
      weekGrid.innerHTML = weekEntries
        .map((entry) => renderDayCard(entry, calendarGoldPreview))
        .join('');
    }

    const olderSection = document.getElementById('calOlderSection');
    if (olderSection) {
      if (calendarGoldPreview) {
        olderSection.innerHTML = `<div class="cal-grid">${olderEntries.map((e) => renderDayCard(e, true)).join('')}</div>`;
      } else {
        olderSection.innerHTML = `
          <div class="cal-lock-wrap">
            <div class="cal-grid cal-grid-blur">${olderPreview.map((e) => renderDayCard(e, false)).join('')}</div>
            <div class="cal-lock-overlay">
              <span class="cal-lock-big" aria-hidden="true">🔒</span>
              <div class="cal-lock-title">${COPY.calendar.lockTitle(olderEntries.length)}</div>
              <div class="cal-lock-sub">${COPY.calendar.lockSub}</div>
            </div>
          </div>
          <button type="button" class="cal-gold-btn" onclick="window.ZazuWebScreens.showGoldUpsell()">${COPY.calendar.unlockGold}</button>
          <p class="cal-gold-sub">${COPY.calendar.goldPricing}</p>`;
      }
    }
  }

  function openCalendarEntry(dayOffset) {
    const entry = window.ZazuWebScreens._calendarEntries?.find((e) => e.dayOffset === dayOffset);
    if (!entry) return;
    selectedCalendarEntry = entry;
    renderWordSheet(entry);
    const sheet = document.getElementById('wordDetailSheet');
    if (sheet?.showModal) sheet.showModal();
  }

  function closeWordSheet() {
    const sheet = document.getElementById('wordDetailSheet');
    if (sheet?.open) sheet.close();
    selectedCalendarEntry = null;
  }

  function renderWordSheet(entry) {
    const progress = window.ZazuProgress?.readProgress()?.wordProgress ?? [];
    const word = entry.word;
    const question =
      word.morningTask?.question ??
      (word.morningTask?.taskType === 'definition'
        ? `What does ${word.word} mean?`
        : `Morning task for ${word.word}`);

    document.getElementById('sheetEyebrow').textContent = entry.dateLabelLong;
    document.getElementById('sheetWord').textContent = word.word;
    document.getElementById('sheetPron').textContent = `${word.pronunciation} · ${word.pos}`;
    document.getElementById('sheetDef').textContent = word.definition;
    document.getElementById('sheetEtym').innerHTML = word.origin ?? '';
    document.getElementById('sheetTaskQ').textContent = question;

    const saved = window.ZazuProgress?.readProgress() ?? { streak: 0 };
    const streakDay = Math.max(1, saved.streak - entry.dayOffset);
    document.getElementById('sheetStreak').textContent = COPY.calendar.streakDayOf(streakDay);

    const dismiss = window.ZazuCalendar.formatDismissTime(entry.dismissSeconds);
    document.getElementById('sheetDismiss').textContent =
      entry.completed && entry.dismissSeconds != null
        ? `${COPY.calendar.timeToDismiss}: ${dismiss}`
        : COPY.calendar.notCompleted;

    const gymRow = document.getElementById('sheetGymRow');
    const gymBtn = document.getElementById('sheetGymBtn');
    const gym = window.ZazuCalendar.resolveGymDisplay(
      calendarGoldPreview,
      entry.gymCompleted,
      entry.completed,
    );

    if (gymRow) {
      if (gym === 'done') {
        gymRow.innerHTML = `<span>${COPY.calendar.gymCompleted}</span><span>✓</span>`;
      } else if (gym === 'locked') {
        gymRow.innerHTML = `<span>${COPY.calendar.goldFeature}</span><button type="button" class="sheet-link-btn" onclick="window.ZazuWebScreens.showGoldUpsell()">${COPY.calendar.unlock}</button>`;
      } else if (gym === 'open') {
        gymRow.innerHTML = `<span>${COPY.calendar.wordGym}</span><button type="button" class="sheet-link-btn" onclick="window.ZazuWebScreens.openEntryInGym()">${COPY.calendar.openGym}</button>`;
      } else {
        gymRow.innerHTML = `<span>${COPY.calendar.gymNotDone}</span><span>–</span>`;
      }
    }
    if (gymBtn) gymBtn.hidden = gym !== 'open';
  }

  function showGoldUpsell() {
    alert(`${COPY.calendar.unlockGold.replace(' ↗', '')}\n\n${COPY.calendar.goldPricing}`);
  }

  function openEntryInGym() {
    if (!selectedCalendarEntry) return;
    closeWordSheet();
    if (typeof window.startGymFromWord === 'function') {
      window.startGymFromWord(selectedCalendarEntry.word);
    }
  }

  function setCalendarGoldPreview(isGold) {
    calendarGoldPreview = isGold;
    window.ZazuSettings?.setGoldPreview(isGold);
    renderCalendar();
  }

  function renderSettings() {
    const settings = window.ZazuSettings?.readSettings() ?? {};
    const nameEl = document.getElementById('settingsAccountTitle');
    const hintEl = document.getElementById('settingsAccountHint');
    const planEl = document.getElementById('settingsPlan');

    if (settings.displayName) {
      if (nameEl) nameEl.textContent = COPY.settings.signedInAs(settings.displayName);
      if (hintEl) hintEl.hidden = true;
    } else {
      if (nameEl) nameEl.textContent = COPY.settings.guestMode;
      if (hintEl) {
        hintEl.hidden = false;
        hintEl.textContent = COPY.settings.guestHint;
      }
    }

    if (planEl) {
      planEl.textContent = settings.goldPreview ? COPY.settings.goldMember : COPY.settings.freePlan;
    }

    const notifToggle = document.getElementById('settingsNotifToggle');
    if (notifToggle) {
      notifToggle.checked = settings.notificationsEnabled;
    }

    const themeSelect = document.getElementById('settingsThemeSelect');
    if (themeSelect) {
      themeSelect.value = settings.themeOverride || 'auto';
    }

    const notifHint = document.getElementById('settingsNotifHint');
    if (notifHint) {
      notifHint.textContent =
        'Notification permission: ' +
        (typeof Notification !== 'undefined' ? Notification.permission : 'unsupported') +
        '. Scheduled morning alarms require the mobile app.';
    }
  }

  async function handleNotifToggle(enabled) {
    if (enabled) {
      const result = await window.ZazuSettings.enableNotifications();
      if (!result.ok) {
        alert(result.reason);
        const toggle = document.getElementById('settingsNotifToggle');
        if (toggle) toggle.checked = false;
      }
    } else {
      window.ZazuSettings.disableNotifications();
    }
  }

  function handleThemeChange(mode) {
    window.ZazuSettings.setThemeOverride(mode);
    if (typeof window.applyThemeFromSettings === 'function') {
      window.applyThemeFromSettings(mode);
    }
  }

  function handleSignIn() {
    const name = prompt('Display name (stored on this device only until full sign-in ships):', '');
    if (name != null && name.trim()) {
      window.ZazuSettings.setDisplayName(name.trim());
      renderSettings();
    }
  }

  function handleSignOut() {
    window.ZazuSettings.setDisplayName('');
    renderSettings();
  }

  function openCalendar(fromScreen) {
    returnScreenAfterOverlay = fromScreen || 'screenHome';
    renderCalendar();
    if (typeof window.showScreen === 'function') window.showScreen('screenCalendar');
  }

  function openSettings(fromScreen) {
    returnScreenAfterOverlay = fromScreen || 'screenHome';
    renderSettings();
    if (typeof window.showScreen === 'function') window.showScreen('screenSettings');
  }

  function closeOverlayScreen() {
    if (typeof window.showScreen === 'function') {
      window.showScreen(returnScreenAfterOverlay);
    }
  }

  window.ZazuWebScreens = {
    renderCalendar,
    openCalendarEntry,
    closeWordSheet,
    showGoldUpsell,
    openEntryInGym,
    setCalendarGoldPreview,
    renderSettings,
    handleNotifToggle,
    handleThemeChange,
    handleSignIn,
    handleSignOut,
    openCalendar,
    openSettings,
    closeOverlayScreen,
    getAlarmWords: () => [],
    _calendarEntries: [],
  };
})();
