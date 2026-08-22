/**
 * force-dark.js
 * Injected via UNFOLD["SCRIPTS"] — runs before Alpine.js initialises.
 * Forces the admin panel to always use dark mode by pinning
 * the Alpine $persist value that controls the theme toggle.
 */
(function () {
  // Alpine persist stores the theme under '_x_adminTheme' in localStorage.
  // Setting it here before Alpine boots makes dark mode permanent.
  try {
    localStorage.setItem('_x_adminTheme', '"dark"');
  } catch (e) {
    // localStorage unavailable (e.g. private browsing) — ignore silently.
  }
})();
