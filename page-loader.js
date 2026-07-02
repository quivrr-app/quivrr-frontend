(function () {
  var LOADER_ID = "quivrrPageLoader";
  var STATUS_SELECTOR = "[data-quivrr-loader-status]";
  var stagedMessages = [
    "Preparing search",
    "Connecting to inventory",
    "Loading brands",
    "Almost ready",
  ];
  var statusTimer = null;
  var hidden = false;
  var pendingHideTimer = null;

  function hasAuthCallback() {
    var params = new URLSearchParams(window.location.search);
    return Boolean(params.get("code") && params.get("state"));
  }

  function loaderElement() {
    return document.getElementById(LOADER_ID);
  }

  function statusElement() {
    return document.querySelector(STATUS_SELECTOR);
  }

  function startStatusCycle() {
    if (statusTimer) {
      return;
    }
    var index = 0;
    statusTimer = window.setInterval(function () {
      if (hidden) {
        return;
      }
      index = (index + 1) % stagedMessages.length;
      setPageLoaderStatus(stagedMessages[index]);
    }, 1400);
  }

  function stopStatusCycle() {
    if (!statusTimer) {
      return;
    }
    window.clearInterval(statusTimer);
    statusTimer = null;
  }

  function cancelPendingHide() {
    if (!pendingHideTimer) {
      return;
    }
    window.clearTimeout(pendingHideTimer);
    pendingHideTimer = null;
  }

  function showPageLoader(message) {
    var loader = loaderElement();
    if (!loader) {
      return;
    }
    cancelPendingHide();
    hidden = false;
    loader.hidden = false;
    loader.setAttribute("aria-hidden", "false");
    loader.classList.remove("quivrr-loader-hidden");
    document.body.classList.add("quivrr-loader-active");
    if (message) {
      setPageLoaderStatus(message);
    }
    startStatusCycle();
  }

  function setPageLoaderStatus(message) {
    var target = statusElement();
    if (!target || !message) {
      return;
    }
    target.textContent = message;
  }

  function hidePageLoader() {
    var loader = loaderElement();
    if (!loader || hidden) {
      return;
    }
    hidden = true;
    stopStatusCycle();
    loader.classList.add("quivrr-loader-hidden");
    loader.setAttribute("aria-hidden", "true");
    pendingHideTimer = window.setTimeout(function () {
      loader.hidden = true;
      document.body.classList.remove("quivrr-loader-active");
      pendingHideTimer = null;
    }, 380);
  }

  function markAppReadyWhenDropdownsLoaded(control) {
    var dropdown = control || document.getElementById("brandSelect");
    if (!dropdown) {
      hidePageLoader();
      return;
    }
    var hasOptions = dropdown.options && dropdown.options.length > 0;
    var selectedText = hasOptions ? String(dropdown.options[0].textContent || "") : "";
    var looksReady = !dropdown.disabled && hasOptions && selectedText.indexOf("Loading") === -1;
    if (looksReady) {
      setPageLoaderStatus("Almost ready");
    }
    hidePageLoader();
  }

  window.addEventListener("quivrr:auth-stage", function (event) {
    var stage = event && event.detail ? event.detail.stage : "";
    if (stage === "callback-start") {
      setPageLoaderStatus("Connecting to your Quivrr account");
      cancelPendingHide();
      showPageLoader("Connecting to your Quivrr account");
      return;
    }
    if (stage === "dashboard-ready") {
      hidePageLoader();
    }
  });

  window.showPageLoader = showPageLoader;
  window.setPageLoaderStatus = setPageLoaderStatus;
  window.hidePageLoader = hidePageLoader;
  window.markAppReadyWhenDropdownsLoaded = markAppReadyWhenDropdownsLoaded;
  window.QuivrrPageLoader = {
    hasAuthCallback: hasAuthCallback,
    showPageLoader: showPageLoader,
    setPageLoaderStatus: setPageLoaderStatus,
    hidePageLoader: hidePageLoader,
    markAppReadyWhenDropdownsLoaded: markAppReadyWhenDropdownsLoaded,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      showPageLoader("Preparing search");
    });
  } else {
    showPageLoader("Preparing search");
  }

  if (!hasAuthCallback()) {
    window.addEventListener("load", function () {
      setPageLoaderStatus("Almost ready");
      window.setTimeout(hidePageLoader, 120);
    });
  }
})();
