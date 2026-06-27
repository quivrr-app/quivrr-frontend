(function () {
  const STORAGE_KEY = "quivrrTheme";
  const root = document.documentElement;

  function readTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
    } catch (error) {
      return "light";
    }
  }

  function writeTheme(theme) {
    root.setAttribute("data-theme", theme);

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      // Ignore storage failures and still apply the theme for the session.
    }
  }

  function iconSvg(theme) {
    if (theme === "dark") {
      return [
        '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">',
        '<path d="M17.4 14.8A7.9 7.9 0 0 1 9.2 4.2a.8.8 0 0 0-1-.95A9.95 9.95 0 1 0 20.75 15.8a.8.8 0 0 0-.95-1Z" fill="currentColor"></path>',
        "</svg>"
      ].join("");
    }

    return [
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">',
      '<circle cx="12" cy="12" r="4.2" fill="currentColor"></circle>',
      '<path d="M12 1.8v2.4M12 19.8v2.4M4.7 4.7l1.7 1.7M17.6 17.6l1.7 1.7M1.8 12h2.4M19.8 12h2.4M4.7 19.3l1.7-1.7M17.6 6.4l1.7-1.7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"></path>',
      "</svg>"
    ].join("");
  }

  function buttonTitle(theme) {
    return theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
  }

  function findMountPoint() {
    return (
      document.querySelector(".hero-header-actions") ||
      document.querySelector(".ops-header-top") ||
      document.querySelector(".site-header") ||
      document.querySelector(".coming-soon-shell .site-header") ||
      document.body
    );
  }

  function ensureSlot(mountPoint) {
    let slot = mountPoint.querySelector(".theme-toggle-slot");

    if (slot) {
      return slot;
    }

    slot = document.createElement("div");
    slot.className = "theme-toggle-slot";
    mountPoint.appendChild(slot);
    return slot;
  }

  function updateButton(button, theme) {
    button.dataset.theme = theme;
    button.setAttribute("aria-label", buttonTitle(theme));
    button.setAttribute("title", buttonTitle(theme));
    button.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    button.querySelector(".theme-toggle-icon").innerHTML = iconSvg(theme);
  }

  function mountToggle() {
    const mountPoint = findMountPoint();

    if (!mountPoint) {
      return;
    }

    const slot = ensureSlot(mountPoint);
    let button = slot.querySelector("[data-theme-toggle]");
    const theme = readTheme();

    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "theme-toggle";
      button.dataset.themeToggle = "true";
      button.innerHTML = [
        '<span class="theme-toggle-icon"></span>',
        '<span class="sr-only">Toggle theme</span>'
      ].join("");

      button.addEventListener("click", function () {
        const nextTheme =
          root.getAttribute("data-theme") === "dark" ? "light" : "dark";

        writeTheme(nextTheme);
        updateButton(button, nextTheme);
      });

      slot.appendChild(button);
    }

    updateButton(button, theme);
  }

  writeTheme(readTheme());

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountToggle, { once: true });
  } else {
    mountToggle();
  }
})();
