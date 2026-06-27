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
      // Ignore storage failures and still apply the theme for this session.
    }
  }

  function buttonLabel(theme) {
    return theme === "dark" ? "Light" : "Dark";
  }

  function mountToggle() {
    if (document.querySelector("[data-theme-toggle]")) {
      return;
    }

    const button = document.createElement("button");
    const theme = readTheme();

    button.type = "button";
    button.className = "theme-toggle";
    button.dataset.themeToggle = "true";
    button.setAttribute("aria-live", "polite");
    button.setAttribute("aria-label", "Toggle dark mode");
    button.innerHTML = '<span class="theme-toggle-label"></span>';
    button.querySelector(".theme-toggle-label").textContent = buttonLabel(theme);

    button.addEventListener("click", function () {
      const nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      writeTheme(nextTheme);
      button.querySelector(".theme-toggle-label").textContent = buttonLabel(nextTheme);
    });

    document.body.appendChild(button);
  }

  writeTheme(readTheme());

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountToggle, { once: true });
  } else {
    mountToggle();
  }
})();
