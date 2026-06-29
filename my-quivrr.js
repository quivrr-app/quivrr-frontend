(function () {
  const body = document.body;
  const STORAGE_KEY = "quivrrAuthSession";
  const PKCE_KEY = "quivrrAuthPkce";
  const ANON_SESSION_KEY = "quivrrAnonymousSessionId";
  const DEFAULT_API_BASE = "https://quivrr-backend-api.azurewebsites.net";
  const SKILL_LEVEL_OPTIONS = [
    "Beginner",
    "Progressing",
    "Intermediate",
    "Advanced",
    "Expert",
  ];
  const WAVE_TYPE_OPTIONS = [
    "Beach break",
    "Point break",
    "Reef break",
    "Slab",
    "River mouth",
    "Small fun waves",
    "Mixed conditions",
  ];
  const WAVE_SIZE_OPTIONS = [
    "1 to 2 ft",
    "2 to 3 ft",
    "3 to 4 ft",
    "4 to 6 ft",
    "6 ft plus",
    "Mixed",
  ];
  const SURF_FREQUENCY_OPTIONS = [
    "A few times a year",
    "Monthly",
    "Fortnightly",
    "Weekly",
    "Several times a week",
    "Daily if there are waves",
  ];
  const SURFING_GOAL_OPTIONS = [
    "Catch more waves",
    "More paddle power",
    "More speed",
    "Tighter turns",
    "More hold",
    "Better in bigger waves",
    "Better in small waves",
    "More forgiving board",
    "Performance progression",
  ];

  function renderSelectOptions(options) {
    return options.map(function (option) {
      return '<option value="' + option + '">' + option + "</option>";
    }).join("");
  }

  function authConfig() {
    const configured = window.QUIVRR_AUTH_CONFIG || {};
    return {
      enabled: configured.enabled === true,
      clientId: configured.clientId || "",
      authority: (configured.authority || "").replace(/\/$/, ""),
      redirectUri: configured.redirectUri || window.location.href.split("#")[0].split("?")[0],
      scopes: configured.scopes || ["openid", "profile", "email"],
      apiBaseUrl: (configured.apiBaseUrl || DEFAULT_API_BASE).replace(/\/$/, ""),
      postLogoutRedirectUri: configured.postLogoutRedirectUri || window.location.origin + "/",
    };
  }

  function isConfigured(config) {
    return Boolean(config.enabled && config.clientId && config.authority);
  }

  function signInDisabledMessage() {
    return "My Quivrr sign-in is being enabled for this environment. Search and Bodhi stay open while authentication is configured.";
  }

  function getSession() {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
    } catch (error) {
      return null;
    }
  }

  function setSession(session) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  function clearSession() {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(PKCE_KEY);
  }

  function randomString(length) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, function (byte) {
      return ("0" + byte.toString(16)).slice(-2);
    }).join("");
  }

  function getAnonymousSessionId() {
    try {
      var existing = localStorage.getItem(ANON_SESSION_KEY);
      if (existing) {
        return existing;
      }
      var created = "anon-" + randomString(16);
      localStorage.setItem(ANON_SESSION_KEY, created);
      return created;
    } catch (error) {
      return "anon-" + randomString(16);
    }
  }

  function base64Url(buffer) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  async function sha256(value) {
    const data = new TextEncoder().encode(value);
    return crypto.subtle.digest("SHA-256", data);
  }

  function requestHeaders(accessToken) {
    const headers = { "Content-Type": "application/json" };
    if (accessToken) {
      headers.Authorization = "Bearer " + accessToken;
    }
    return headers;
  }

  function isAuthenticated() {
    const session = getSession();
    return Boolean(session && session.accessToken && session.expiresAt > Date.now());
  }

  async function callApi(path, options) {
    const config = authConfig();
    const session = getSession();
    const accessToken = options && options.accessToken !== undefined
      ? options.accessToken
      : (session ? session.accessToken : null);

    const response = await fetch(config.apiBaseUrl + path, {
      method: options && options.method ? options.method : "GET",
      headers: requestHeaders(accessToken),
      body: options && options.body ? JSON.stringify(options.body) : undefined,
      keepalive: options && options.keepalive === true,
    });

    if (!response.ok) {
      throw new Error("My Quivrr API request failed.");
    }

    return response.json();
  }

  async function postEvent(payload) {
    const session = getSession();
    const bodyPayload = { ...payload };
    if (!session || !session.accessToken || session.expiresAt <= Date.now()) {
      bodyPayload.anonymousSessionId = getAnonymousSessionId();
    }

    try {
      await callApi("/api/events", {
        method: "POST",
        body: bodyPayload,
        keepalive: true,
      });
    } catch (error) {
      // Events should never break search or navigation.
    }
  }

  function formatDate(value) {
    if (!value) {
      return "Just now";
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    return parsed.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function toDisplayText(value, fallback) {
    return value === null || value === undefined || value === "" ? fallback : value;
  }

  function mountEntryButton() {
    const mount = document.querySelector(".hero-header-actions");
    if (!mount || mount.querySelector("[data-my-quivrr-open]")) {
      return;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "my-quivrr-entry";
    button.setAttribute("data-my-quivrr-open", "true");
    button.setAttribute("aria-label", "Open My Quivrr");
    button.innerHTML = [
      '<span class="my-quivrr-entry-avatar" aria-hidden="true">MQ</span>',
      '<span class="my-quivrr-entry-text"><small>My Quivrr</small><strong>Sign in</strong></span>'
    ].join("");

    const toggleSlot = mount.querySelector(".theme-toggle-slot");
    if (toggleSlot) {
      mount.insertBefore(button, toggleSlot);
    } else {
      mount.appendChild(button);
    }
  }

  function createModal() {
    const modal = document.createElement("div");
    modal.className = "my-quivrr-modal";
    modal.hidden = true;
    modal.innerHTML = [
      '<button type="button" class="my-quivrr-modal-backdrop" aria-label="Close My Quivrr dialog"></button>',
      '<div class="my-quivrr-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="myQuivrrTitle">',
      '  <button type="button" class="my-quivrr-modal-close" aria-label="Close My Quivrr dialog">×</button>',
      '  <div class="my-quivrr-modal-header">',
      '    <div class="my-quivrr-modal-kicker">My Quivrr</div>',
      '    <h2 id="myQuivrrTitle">Sign in to My Quivrr.</h2>',
      '    <p>Search stays open without login. Signing in creates your Quivrr identity, gives you a real quiver, and keeps your saved boards synced through the backend.</p>',
      '  </div>',
      '  <ul class="my-quivrr-benefits">',
      '    <li>Profile summary</li>',
      '    <li>Saved boards</li>',
      '    <li>My quiver</li>',
      '    <li>Recent activity</li>',
      '  </ul>',
      '  <section class="my-quivrr-step" data-my-quivrr-step="providers">',
      '    <div class="my-quivrr-step-label">Secure sign in</div>',
      '    <div class="my-quivrr-provider-grid">',
      '      <button type="button" class="my-quivrr-provider-button" data-my-quivrr-sign-in><span>Continue with My Quivrr</span><span>Microsoft Entra External ID</span></button>',
      '    </div>',
      '    <p class="my-quivrr-modal-note">Your provider choice is handled inside the secure Microsoft sign-in flow.</p>',
      '  </section>',
      '  <section class="my-quivrr-step" data-my-quivrr-step="profile" hidden>',
      '    <div class="my-quivrr-step-label">Complete your My Quivrr profile</div>',
      '    <p>Optional, but useful. The more we know about how and where you surf, the better Bodhi can guide board recommendations, volume ranges and future stock alerts.</p>',
      '    <form class="my-quivrr-form-grid" data-my-quivrr-profile-form>',
      '      <div class="my-quivrr-form-section full">',
      '        <div class="my-quivrr-step-label">Your surfing</div>',
      '        <p>Start with the basics that shape volume, forgiveness and performance.</p>',
      '      </div>',
      '      <label class="my-quivrr-form-field"><span>Display name</span><input name="displayName" type="text" autocomplete="name" data-clearable="displayName" /></label>',
      '      <label class="my-quivrr-form-field"><span>Skill level</span><select name="ability" data-clearable="ability"><option value="">Choose a level</option>' + renderSelectOptions(SKILL_LEVEL_OPTIONS) + '</select></label>',
      '      <label class="my-quivrr-form-field"><span>Height cm</span><input name="heightCm" type="number" inputmode="numeric" data-clearable="heightCm" /></label>',
      '      <label class="my-quivrr-form-field"><span>Weight kg</span><input name="weightKg" type="number" inputmode="numeric" data-clearable="weightKg" /></label>',
      '      <label class="my-quivrr-form-field"><span>Usual volume litres</span><input name="currentVolumeLitres" type="number" step="0.1" inputmode="decimal" data-clearable="currentVolumeLitres" /></label>',
      '      <label class="my-quivrr-form-field"><span>Surfing goal</span><select name="surfingGoal" data-clearable="surfingGoal"><option value="">Choose a goal</option>' + renderSelectOptions(SURFING_GOAL_OPTIONS) + '</select></label>',
      '      <div class="my-quivrr-form-section full">',
      '        <div class="my-quivrr-step-label">Your boards</div>',
      '        <p>Let Quivrr and Bodhi understand the boards and ranges that already work for you.</p>',
      '      </div>',
      '      <label class="my-quivrr-form-field"><span>Preferred volume min</span><input name="preferredVolumeMinLitres" type="number" step="0.1" inputmode="decimal" data-clearable="preferredVolumeMinLitres" /></label>',
      '      <label class="my-quivrr-form-field"><span>Preferred volume max</span><input name="preferredVolumeMaxLitres" type="number" step="0.1" inputmode="decimal" data-clearable="preferredVolumeMaxLitres" /></label>',
      '      <label class="my-quivrr-form-field full"><span>Current board</span><input name="currentBoard" type="text" autocomplete="off" placeholder="5\'8 groveller, 6\'1 step-up, 9\'1 log" data-clearable="currentBoard" /></label>',
      '      <div class="my-quivrr-form-section full">',
      '        <div class="my-quivrr-step-label">Your waves</div>',
      '        <p>Where and what you surf matters just as much as raw litres.</p>',
      '      </div>',
      '      <label class="my-quivrr-form-field"><span>Home region</span><select name="homeRegion" data-clearable="homeRegion"><option value="">Choose a region</option><option value="AU">Australia</option><option value="ID">Indonesia</option><option value="EU">Europe</option><option value="US">United States</option></select></label>',
      '      <label class="my-quivrr-form-field"><span>Home break</span><input name="homeBreak" type="text" autocomplete="off" data-clearable="homeBreak" /></label>',
      '      <label class="my-quivrr-form-field"><span>Location</span><input name="homeCountry" type="text" autocomplete="country-name" data-clearable="homeCountry" /></label>',
      '      <label class="my-quivrr-form-field"><span>Favourite wave type</span><select name="waveType" data-clearable="waveType"><option value="">Choose a wave type</option>' + renderSelectOptions(WAVE_TYPE_OPTIONS) + '</select></label>',
      '      <label class="my-quivrr-form-field"><span>Usual wave size</span><select name="waveSize" data-clearable="waveSize"><option value="">Choose a size</option>' + renderSelectOptions(WAVE_SIZE_OPTIONS) + '</select></label>',
      '      <label class="my-quivrr-form-field"><span>Surf frequency</span><select name="surfFrequency" data-clearable="surfFrequency"><option value="">Choose a rhythm</option>' + renderSelectOptions(SURF_FREQUENCY_OPTIONS) + '</select></label>',
      '      <div class="my-quivrr-form-section full">',
      '        <div class="my-quivrr-step-label">Your preferences</div>',
      '        <p>Favourite brands help Quivrr highlight the boards you are most likely to want.</p>',
      '      </div>',
      '      <label class="my-quivrr-form-field full"><span>Preferred brands</span><input name="preferredBrands" type="text" autocomplete="off" placeholder="Album, Pyzel, JS Industries" data-clearable="preferredBrands" /></label>',
      '    </form>',
      '    <p class="my-quivrr-modal-note">You control this. Everything is optional and can be changed later.</p>',
      '    <div class="my-quivrr-form-actions">',
      '      <button type="button" class="my-quivrr-modal-action secondary" data-my-quivrr-skip-profile="later">Remind me later</button>',
      '      <button type="button" class="my-quivrr-modal-action secondary" data-my-quivrr-skip-profile="skip">Skip for now</button>',
      '      <button type="button" class="my-quivrr-modal-action" data-my-quivrr-save-profile>Save profile</button>',
      '    </div>',
      '  </section>',
      '  <section class="my-quivrr-step" data-my-quivrr-step="account" hidden>',
      '    <div class="my-quivrr-account-header">',
      '      <div>',
      '        <div class="my-quivrr-step-label">My Quivrr</div>',
      '        <p data-my-quivrr-account-summary>Your My Quivrr identity is active.</p>',
      '      </div>',
      '      <div class="my-quivrr-form-actions my-quivrr-account-actions">',
      '        <button type="button" class="my-quivrr-modal-action secondary" data-my-quivrr-edit-profile>Edit profile</button>',
      '        <button type="button" class="my-quivrr-modal-action secondary" data-my-quivrr-add-custom-board>Add custom board</button>',
      '        <button type="button" class="my-quivrr-modal-action" data-my-quivrr-logout>Log out</button>',
      '      </div>',
      '    </div>',
      '    <div class="my-quivrr-panel my-quivrr-onboarding-card" data-my-quivrr-onboarding-card hidden></div>',
      '    <div class="my-quivrr-stats" data-my-quivrr-stats></div>',
      '    <div class="my-quivrr-dashboard">',
      '      <section class="my-quivrr-panel">',
      '        <h3>Profile summary</h3>',
      '        <div class="my-quivrr-summary-grid" data-my-quivrr-profile-summary></div>',
      '      </section>',
      '      <section class="my-quivrr-panel">',
      '        <div class="my-quivrr-panel-header"><h3>Current quiver</h3><button type="button" class="my-quivrr-mini-action" data-my-quivrr-add-custom-board>Add</button></div>',
      '        <div data-my-quivrr-quiver-list></div>',
      '      </section>',
      '      <section class="my-quivrr-panel">',
      '        <h3>Saved boards</h3>',
      '        <div data-my-quivrr-saved-list></div>',
      '      </section>',
      '      <section class="my-quivrr-panel">',
      '        <h3>Recent activity</h3>',
      '        <div data-my-quivrr-activity-list></div>',
      '      </section>',
      '    </div>',
      '    <div class="my-quivrr-panel my-quivrr-editor" data-my-quivrr-quiver-editor hidden>',
      '      <div class="my-quivrr-panel-header"><h3 data-my-quivrr-quiver-editor-title>Add custom board</h3><button type="button" class="my-quivrr-mini-action" data-my-quivrr-cancel-quiver>Edit later</button></div>',
      '      <form class="my-quivrr-form-grid" data-my-quivrr-quiver-form>',
      '        <input name="quiverId" type="hidden" />',
      '        <input name="boardModelId" type="hidden" />',
      '        <input name="boardSizeId" type="hidden" />',
      '        <input name="customBoard" type="hidden" value="true" />',
      '        <label class="my-quivrr-form-field full" data-my-quivrr-quiver-board-label hidden><span>Board</span><input name="selectedBoardLabel" type="text" readonly /></label>',
      '        <label class="my-quivrr-form-field"><span>Nickname</span><input name="nickname" type="text" autocomplete="off" /></label>',
      '        <label class="my-quivrr-form-field"><span>Board role</span><input name="status" type="text" autocomplete="off" placeholder="Current board, Favourite board, Travel board" /></label>',
      '        <label class="my-quivrr-form-field"><span>Purchase year</span><input name="purchaseYear" type="number" inputmode="numeric" /></label>',
      '        <label class="my-quivrr-form-field"><span>Current board</span><select name="currentBoard"><option value="false">No</option><option value="true">Yes</option></select></label>',
      '        <label class="my-quivrr-form-field"><span>Brand</span><input name="customBrandName" type="text" autocomplete="off" /></label>',
      '        <label class="my-quivrr-form-field"><span>Model</span><input name="customModelName" type="text" autocomplete="off" /></label>',
      '        <label class="my-quivrr-form-field"><span>Dimensions</span><input name="customDimensions" type="text" autocomplete="off" placeholder="5\'8 x 19 1/2 x 2 7/16" /></label>',
      '        <label class="my-quivrr-form-field"><span>Construction</span><input name="customConstruction" type="text" autocomplete="off" /></label>',
      '        <label class="my-quivrr-form-field"><span>Volume litres</span><input name="customVolumeLitres" type="number" step="0.1" inputmode="decimal" /></label>',
      '        <label class="my-quivrr-form-field full"><span>Notes</span><textarea name="notes"></textarea></label>',
      '      </form>',
      '      <div class="my-quivrr-form-actions">',
      '        <button type="button" class="my-quivrr-modal-action secondary" data-my-quivrr-cancel-quiver>Cancel</button>',
      '        <button type="button" class="my-quivrr-modal-action" data-my-quivrr-save-quiver>Save board</button>',
      '      </div>',
      '    </div>',
      '  </section>',
      '  <div class="my-quivrr-modal-status" aria-live="polite"></div>',
      '</div>'
    ].join("");

    body.appendChild(modal);
    return modal;
  }

  const modal = createModal();
  const providerStep = modal.querySelector('[data-my-quivrr-step="providers"]');
  const profileStep = modal.querySelector('[data-my-quivrr-step="profile"]');
  const accountStep = modal.querySelector('[data-my-quivrr-step="account"]');
  const status = modal.querySelector(".my-quivrr-modal-status");
  const profileForm = modal.querySelector("[data-my-quivrr-profile-form]");
  const accountSummary = modal.querySelector("[data-my-quivrr-account-summary]");
  const statsMount = modal.querySelector("[data-my-quivrr-stats]");
  const profileSummaryMount = modal.querySelector("[data-my-quivrr-profile-summary]");
  const quiverListMount = modal.querySelector("[data-my-quivrr-quiver-list]");
  const savedListMount = modal.querySelector("[data-my-quivrr-saved-list]");
  const activityListMount = modal.querySelector("[data-my-quivrr-activity-list]");
  const quiverEditor = modal.querySelector("[data-my-quivrr-quiver-editor]");
  const quiverEditorTitle = modal.querySelector("[data-my-quivrr-quiver-editor-title]");
  const quiverForm = modal.querySelector("[data-my-quivrr-quiver-form]");
  const quiverBoardLabelField = modal.querySelector("[data-my-quivrr-quiver-board-label]");
  const quiverBoardLabelInput = quiverBoardLabelField.querySelector("input");
  const onboardingCard = modal.querySelector("[data-my-quivrr-onboarding-card]");
  var pendingProfileClears = new Set();
  var onboardingShownThisOpen = false;

  function setStatus(message) {
    status.textContent = message || "";
  }

  function updateEntryState(profile) {
    const triggers = document.querySelectorAll("[data-my-quivrr-open]");
    triggers.forEach(function (trigger) {
      const strong = trigger.querySelector("strong");
      if (strong) {
        strong.textContent = profile && profile.user ? "My Quivrr" : "Sign in";
      }
    });
  }

  function showStep(step) {
    providerStep.hidden = step !== "providers";
    profileStep.hidden = step !== "profile";
    accountStep.hidden = step !== "account";
  }

  function currentDashboardState() {
    return window.__quivrrMyQuivrrState || {
      profile: null,
      quiver: [],
      savedBoards: [],
    };
  }

  function setDashboardState(state) {
    window.__quivrrMyQuivrrState = state;
  }

  function resetProfileClears() {
    pendingProfileClears = new Set();
  }

  function mountClearButtons() {
    profileForm.querySelectorAll("[data-clearable]").forEach(function (field) {
      var label = field.closest(".my-quivrr-form-field");
      var header = label ? label.querySelector("span") : null;
      if (!header || header.querySelector("[data-my-quivrr-clear-field]")) {
        return;
      }
      var button = document.createElement("button");
      button.type = "button";
      button.className = "my-quivrr-clear-field";
      button.setAttribute("data-my-quivrr-clear-field", field.getAttribute("name"));
      button.textContent = "Clear";
      header.appendChild(button);
    });
  }

  function fillProfileForm(profileBundle) {
    if (!profileBundle || !profileBundle.profile) {
      profileForm.reset();
      return;
    }
    const profile = profileBundle.profile;
    const user = profileBundle.user || {};
    profileForm.elements.displayName.value = user.displayName || "";
    profileForm.elements.homeRegion.value = user.homeRegion || "";
    profileForm.elements.homeBreak.value = profile.homeBreak || "";
    profileForm.elements.homeCountry.value = profile.homeCountry || "";
    profileForm.elements.heightCm.value = toDisplayText(profile.heightCm, "");
    profileForm.elements.weightKg.value = toDisplayText(profile.weightKg, "");
    profileForm.elements.ability.value = profile.ability || "";
    profileForm.elements.currentVolumeLitres.value = toDisplayText(profile.currentVolumeLitres, "");
    profileForm.elements.preferredVolumeMinLitres.value = toDisplayText(profile.preferredVolumeMinLitres, "");
    profileForm.elements.preferredVolumeMaxLitres.value = toDisplayText(profile.preferredVolumeMaxLitres, "");
    profileForm.elements.waveType.value = profile.waveType || "";
    profileForm.elements.waveSize.value = profile.waveSize || "";
    profileForm.elements.surfFrequency.value = profile.surfFrequency || "";
    profileForm.elements.preferredBrands.value = (profile.preferredBrands || []).join(", ");
    profileForm.elements.currentBoard.value = profile.currentBoard || "";
    profileForm.elements.surfingGoal.value = profile.surfingGoal || "";
    resetProfileClears();
  }

  function renderStats(profile, quiver, savedBoards) {
    const recentCount = (profile.recentActivity || []).length;
    statsMount.innerHTML = [
      ["Quiver", String(quiver.length)],
      ["Saved", String(savedBoards.length)],
      ["Activity", String(recentCount)],
      ["Current", String(quiver.filter(function (item) { return item.currentBoard; }).length)],
    ].map(function (item) {
      return '<div class="my-quivrr-stat"><span>' + item[0] + '</span><strong>' + item[1] + '</strong></div>';
    }).join("");
  }

  function renderProfileSummary(profileBundle) {
    const profile = profileBundle.profile || {};
    const user = profileBundle.user || {};
    const rows = [
      ["Display name", user.displayName || user.email || "Not set"],
      ["Home region", user.homeRegion || "Not set"],
      ["Ability", profile.ability || "Not set"],
      ["Volume", profile.currentVolumeLitres ? profile.currentVolumeLitres + "L" : "Not set"],
      ["Goal", profile.surfingGoal || "Not set"],
      ["Preferred brands", (profile.preferredBrands || []).join(", ") || "Not set"],
      ["Current board", profile.currentBoard || "Not set"],
      ["Home break", profile.homeBreak || "Not set"],
      ["Wave type", profile.waveType || "Not set"],
    ];
    profileSummaryMount.innerHTML = rows.map(function (row) {
      return '<div class="my-quivrr-summary-item"><span>' + row[0] + '</span><strong>' + row[1] + '</strong></div>';
    }).join("");
  }

  function renderEmptyList(target, title, message) {
    target.innerHTML = [
      '<div class="my-quivrr-empty-state">',
      '<strong>' + title + '</strong>',
      '<p>' + message + '</p>',
      '</div>',
    ].join("");
  }

  function renderQuiverList(quiver) {
    if (!quiver.length) {
      renderEmptyList(quiverListMount, "No boards in your quiver yet.", "Save a board from search results or add a custom board here.");
      return;
    }
    quiverListMount.innerHTML = quiver.map(function (item) {
      return [
        '<article class="my-quivrr-list-item">',
        '  <div class="my-quivrr-list-copy">',
        '    <strong>' + (item.nickname || item.title || "Untitled board") + '</strong>',
        '    <p>' + [item.status, item.currentBoard ? "Current board" : null, item.notes].filter(Boolean).join(" | ") + '</p>',
        '    <small>' + (item.title || "Custom board") + '</small>',
        '  </div>',
        '  <div class="my-quivrr-list-actions">',
        '    <button type="button" class="my-quivrr-mini-action" data-my-quivrr-edit-quiver="' + item.quiverId + '">Edit</button>',
        '    <button type="button" class="my-quivrr-mini-action" data-my-quivrr-delete-quiver="' + item.quiverId + '">Remove</button>',
        item.currentBoard ? "" : '    <button type="button" class="my-quivrr-mini-action" data-my-quivrr-set-current="' + item.quiverId + '">Set current</button>',
        '  </div>',
        '</article>',
      ].join("");
    }).join("");
  }

  function renderSavedBoards(savedBoards) {
    if (!savedBoards.length) {
      renderEmptyList(savedListMount, "No saved boards yet.", "Use Save board on any search result to build your shortlist.");
      return;
    }
    savedListMount.innerHTML = savedBoards.map(function (item) {
      return [
        '<article class="my-quivrr-list-item">',
        '  <div class="my-quivrr-list-copy">',
        '    <strong>' + (item.title || "Saved board") + '</strong>',
        '    <p>' + [item.regionCode, item.note].filter(Boolean).join(" | ") + '</p>',
        '    <small>Saved ' + formatDate(item.createdUtc) + '</small>',
        '  </div>',
        '  <div class="my-quivrr-list-actions">',
        '    <button type="button" class="my-quivrr-mini-action" data-my-quivrr-add-saved-to-quiver="' + item.savedBoardId + '">Add to quiver</button>',
        '    <button type="button" class="my-quivrr-mini-action" data-my-quivrr-delete-saved="' + item.savedBoardId + '">Remove</button>',
        '  </div>',
        '</article>',
      ].join("");
    }).join("");
  }

  function renderRecentActivity(profileBundle) {
    const recentActivity = profileBundle.recentActivity || [];
    if (!recentActivity.length) {
      renderEmptyList(activityListMount, "No recent activity yet.", "Your searches, saved boards, and viewed boards will start appearing here.");
      return;
    }
    activityListMount.innerHTML = recentActivity.map(function (item) {
      return [
        '<article class="my-quivrr-list-item">',
        '  <div class="my-quivrr-list-copy">',
        '    <strong>' + item.eventType + '</strong>',
        '    <p>' + (item.title || "Quivrr activity") + '</p>',
        '    <small>' + [item.regionCode, formatDate(item.createdUtc)].filter(Boolean).join(" | ") + '</small>',
        '  </div>',
        '</article>',
      ].join("");
    }).join("");
  }

  function renderOnboardingCard(profileBundle) {
    if (profileBundle.profileComplete) {
      onboardingCard.hidden = true;
      onboardingCard.innerHTML = "";
      return;
    }
    var strength = profileBundle.profileStrength || "none";
    var usefulCount = profileBundle.profileUsefulFieldCount || 0;
    var progressLine = strength === "partial"
      ? "You have already filled " + usefulCount + " helpful profile fields. A little more detail helps Bodhi guide better boards and volume ranges."
      : "Optional, but useful. The more we know about how and where you surf, the better Bodhi can guide board recommendations, volume ranges and future stock alerts.";
    onboardingCard.hidden = false;
    onboardingCard.innerHTML = [
      '<div class="my-quivrr-step-label">Complete your My Quivrr profile</div>',
      '<h3>Optional, but useful.</h3>',
      '<p>' + progressLine + '</p>',
      '<p class="my-quivrr-modal-note">You control this. Everything is optional and can be changed later.</p>',
      '<div class="my-quivrr-form-actions">',
      '  <button type="button" class="my-quivrr-modal-action" data-my-quivrr-open-profile>Complete profile</button>',
      '  <button type="button" class="my-quivrr-modal-action secondary" data-my-quivrr-skip-profile="skip">Skip for now</button>',
      '  <button type="button" class="my-quivrr-modal-action secondary" data-my-quivrr-skip-profile="later">Remind me later</button>',
      '</div>'
    ].join("");
    if (!onboardingShownThisOpen) {
      onboardingShownThisOpen = true;
      postEvent({
        eventType: "ProfileOnboardingShown",
        regionCode: profileBundle.user ? profileBundle.user.homeRegion : null,
        payload: {
          profileStrength: strength,
          usefulFieldCount: usefulCount,
        },
      });
    }
  }

  function hideQuiverEditor() {
    quiverEditor.hidden = true;
    quiverForm.reset();
    quiverBoardLabelField.hidden = true;
    quiverBoardLabelInput.value = "";
    quiverForm.elements.boardModelId.value = "";
    quiverForm.elements.boardSizeId.value = "";
    quiverForm.elements.customBoard.value = "true";
  }

  function showQuiverEditor(mode, item) {
    quiverEditor.hidden = false;
    quiverEditorTitle.textContent = mode === "edit" ? "Edit quiver board" : "Add custom board";
    quiverForm.reset();
    quiverForm.elements.quiverId.value = item && item.quiverId ? item.quiverId : "";
    quiverForm.elements.boardModelId.value = item && item.boardModelId ? item.boardModelId : "";
    quiverForm.elements.boardSizeId.value = item && item.boardSizeId ? item.boardSizeId : "";
    quiverForm.elements.nickname.value = item && item.nickname ? item.nickname : "";
    quiverForm.elements.purchaseYear.value = item && item.purchaseYear ? item.purchaseYear : "";
    quiverForm.elements.status.value = item && item.status ? item.status : "";
    quiverForm.elements.currentBoard.value = item && item.currentBoard ? "true" : "false";
    quiverForm.elements.notes.value = item && item.notes ? item.notes : "";
    quiverForm.elements.customBrandName.value = item && item.customBrandName ? item.customBrandName : "";
    quiverForm.elements.customModelName.value = item && item.customModelName ? item.customModelName : "";
    quiverForm.elements.customDimensions.value = item && item.customDimensions ? item.customDimensions : "";
    quiverForm.elements.customConstruction.value = item && item.customConstruction ? item.customConstruction : "";
    quiverForm.elements.customVolumeLitres.value = item && item.customVolumeLitres ? item.customVolumeLitres : "";
    quiverForm.elements.customBoard.value = item && item.customBoard ? "true" : (item && item.boardSizeId ? "false" : "true");

    if (item && item.title && !item.customBoard) {
      quiverBoardLabelField.hidden = false;
      quiverBoardLabelInput.value = item.title;
    } else {
      quiverBoardLabelField.hidden = true;
      quiverBoardLabelInput.value = "";
    }
  }

  async function loadDashboard() {
    const profile = await callApi("/api/my-quivrr/profile");
    const quiverResponse = await callApi("/api/my-quivrr/quiver");
    const savedBoardsResponse = await callApi("/api/my-quivrr/saved-boards");
    const state = {
      profile: profile,
      quiver: quiverResponse.quiver || [],
      savedBoards: savedBoardsResponse.savedBoards || [],
    };
    setDashboardState(state);
    fillProfileForm(profile);
    renderStats(profile, state.quiver, state.savedBoards);
    renderProfileSummary(profile);
    renderQuiverList(state.quiver);
    renderSavedBoards(state.savedBoards);
    renderRecentActivity(profile);
    renderOnboardingCard(profile);
    accountSummary.textContent = profile.user && profile.user.email
      ? "Signed in as " + profile.user.email + "."
      : "Your My Quivrr identity is active.";
    updateEntryState(profile);
    return state;
  }

  async function openModal() {
    const session = getSession();
    modal.hidden = false;
    body.style.overflow = "hidden";
    hideQuiverEditor();
    onboardingShownThisOpen = false;
    setStatus("");

    if (session && session.profile && session.expiresAt > Date.now()) {
      showStep("account");
      try {
        await loadDashboard();
      } catch (error) {
        setStatus("My Quivrr could not load right now. Please try again.");
      }
      return;
    }

    showStep("providers");
    const firstButton = modal.querySelector("[data-my-quivrr-sign-in]");
    if (firstButton) {
      firstButton.focus();
    }
  }

  function closeModal() {
    modal.hidden = true;
    body.style.overflow = "";
  }

  async function startSignIn() {
    const config = authConfig();
    if (!isConfigured(config)) {
      setStatus(signInDisabledMessage());
      return;
    }

    const verifier = randomString(48);
    const state = randomString(24);
    const challenge = base64Url(await sha256(verifier));
    sessionStorage.setItem(PKCE_KEY, JSON.stringify({
      verifier: verifier,
      state: state,
      returnTo: window.location.href.split("#")[0],
    }));

    const params = new URLSearchParams({
      client_id: config.clientId,
      response_type: "code",
      redirect_uri: config.redirectUri,
      response_mode: "query",
      scope: config.scopes.join(" "),
      state: state,
      code_challenge: challenge,
      code_challenge_method: "S256",
    });
    window.location.assign(config.authority + "/oauth2/v2.0/authorize?" + params.toString());
  }

  async function exchangeCode(code, state) {
    const config = authConfig();
    const pkce = JSON.parse(sessionStorage.getItem(PKCE_KEY) || "{}");
    if (!pkce.verifier || pkce.state !== state) {
      throw new Error("Sign-in state could not be verified.");
    }

    const response = await fetch(config.authority + "/oauth2/v2.0/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: config.clientId,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: config.redirectUri,
        code_verifier: pkce.verifier,
        scope: config.scopes.join(" "),
      }),
    });

    if (!response.ok) {
      throw new Error("Token exchange failed.");
    }

    const token = await response.json();
    const accessToken = token.access_token;
    if (!accessToken) {
      throw new Error("No access token returned by Entra External ID.");
    }

    const me = await callApi("/api/me", { accessToken: accessToken });
    setSession({
      accessToken: accessToken,
      expiresAt: Date.now() + ((token.expires_in || 3600) * 1000),
      profile: me,
    });
    sessionStorage.removeItem(PKCE_KEY);
    updateEntryState(me);
    window.history.replaceState({}, document.title, pkce.returnTo || window.location.pathname);
    modal.hidden = false;

    showStep("account");
    await loadDashboard();
    if (!me.profileComplete) {
      setStatus("Optional, but useful. Add a few surfing details whenever you are ready.");
    }
  }

  function profilePayload() {
    const data = new FormData(profileForm);
    const payload = {};
    data.forEach(function (value, key) {
      if (!value) {
        return;
      }
      payload[key] = key === "preferredBrands"
        ? String(value).split(",").map(function (brand) { return brand.trim(); }).filter(Boolean)
        : value;
    });
    if (pendingProfileClears.size) {
      payload.clearFields = Array.from(pendingProfileClears);
    }
    return payload;
  }

  async function saveProfile() {
    try {
      const profile = await callApi("/api/my-quivrr/profile", {
        method: "PUT",
        body: profilePayload(),
      });
      const session = getSession();
      setSession({ ...session, profile: profile });
      resetProfileClears();
      showStep("account");
      await loadDashboard();
      setStatus(profile.profileStrength === "strong" ? "Profile saved. Bodhi has a strong surf profile to work with now." : "Profile saved. You can always add more detail later.");
    } catch (error) {
      setStatus("Profile could not be saved yet. Please try again.");
    }
  }

  function openProfileEditor() {
    showStep("profile");
    setStatus("Tell us a bit about your surfing. Everything here is optional.");
  }

  async function skipProfile(reason) {
    showStep("account");
    await loadDashboard();
    await postEvent({
      eventType: "ProfileSkipped",
      regionCode: currentDashboardState().profile && currentDashboardState().profile.user
        ? currentDashboardState().profile.user.homeRegion
        : null,
      payload: { reason: reason },
    });
    setStatus(reason === "later" ? "No problem. We will keep the profile handy for later." : "No problem. You can finish your profile whenever you like.");
  }

  function quiverPayload() {
    const data = new FormData(quiverForm);
    const payload = {};
    data.forEach(function (value, key) {
      if (value === "" && key !== "currentBoard" && key !== "customBoard") {
        return;
      }
      payload[key] = value;
    });
    payload.currentBoard = payload.currentBoard === "true";
    payload.customBoard = payload.customBoard === "true";
    return payload;
  }

  async function saveQuiverItem() {
    try {
      const response = await callApi("/api/my-quivrr/quiver", {
        method: "POST",
        body: quiverPayload(),
      });
      await loadDashboard();
      hideQuiverEditor();
      setStatus(response.status === "updated" ? "Quiver updated." : "Board added to your quiver.");
    } catch (error) {
      setStatus("Quiver changes could not be saved yet.");
    }
  }

  async function deleteQuiverItem(quiverId) {
    try {
      await callApi("/api/my-quivrr/quiver/" + encodeURIComponent(quiverId), {
        method: "DELETE",
      });
      await loadDashboard();
      setStatus("Board removed from your quiver.");
    } catch (error) {
      setStatus("That board could not be removed right now.");
    }
  }

  async function setCurrentBoard(quiverId) {
    const state = currentDashboardState();
    const item = state.quiver.find(function (quiverItem) { return quiverItem.quiverId === quiverId; });
    if (!item) {
      return;
    }
    await callApi("/api/my-quivrr/quiver", {
      method: "POST",
      body: {
        quiverId: item.quiverId,
        boardModelId: item.boardModelId,
        boardSizeId: item.boardSizeId,
        nickname: item.nickname,
        purchaseYear: item.purchaseYear,
        status: item.status,
        currentBoard: true,
        notes: item.notes,
        customBoard: item.customBoard,
        customBrandName: item.customBrandName,
        customModelName: item.customModelName,
        customDimensions: item.customDimensions,
        customConstruction: item.customConstruction,
        customVolumeLitres: item.customVolumeLitres,
      },
    });
    await loadDashboard();
    setStatus("Current board updated.");
  }

  async function deleteSavedBoard(savedBoardId) {
    try {
      await callApi("/api/my-quivrr/saved-boards/" + encodeURIComponent(savedBoardId), {
        method: "DELETE",
      });
      await loadDashboard();
      setStatus("Saved board removed.");
    } catch (error) {
      setStatus("Saved board could not be removed.");
    }
  }

  function addSavedBoardToQuiver(savedBoardId) {
    const state = currentDashboardState();
    const saved = state.savedBoards.find(function (item) { return item.savedBoardId === savedBoardId; });
    if (!saved) {
      return;
    }
    showQuiverEditor("add", {
      boardModelId: saved.boardModelId,
      boardSizeId: saved.boardSizeId,
      customBoard: false,
      title: saved.title,
      status: "Favourite board",
    });
  }

  async function saveBoard(payload) {
    if (!isAuthenticated()) {
      await openModal();
      setStatus("Sign in to save boards to My Quivrr.");
      return { ok: false, reason: "unauthenticated" };
    }

    try {
      const response = await callApi("/api/my-quivrr/saved-boards", {
        method: "POST",
        body: payload,
      });
      if (!modal.hidden && !accountStep.hidden) {
        await loadDashboard();
      }
      setStatus(response.status === "updated" ? "Saved board updated." : "Board saved.");
      return { ok: true, response: response };
    } catch (error) {
      setStatus("This board could not be saved right now.");
      return { ok: false, reason: "error" };
    }
  }

  async function addBoardToQuiver(payload) {
    if (!isAuthenticated()) {
      await openModal();
      setStatus("Sign in to add boards to your quiver.");
      return { ok: false, reason: "unauthenticated" };
    }
    showStep("account");
    showQuiverEditor("add", {
      boardModelId: payload.boardModelId,
      boardSizeId: payload.boardSizeId,
      customBoard: false,
      title: payload.title,
      status: payload.status || "",
    });
    setStatus("Add a nickname or board role, then save it to your quiver.");
    return { ok: true };
  }

  async function logout() {
    const config = authConfig();
    if (isAuthenticated()) {
      try {
        await callApi("/api/logout", { method: "POST" });
      } catch (error) {
        // Client-side cleanup remains safe.
      }
    }
    clearSession();
    updateEntryState(null);
    hideQuiverEditor();
    closeModal();
    if (isConfigured(config)) {
      window.location.assign(
        config.authority + "/oauth2/v2.0/logout?post_logout_redirect_uri=" +
        encodeURIComponent(config.postLogoutRedirectUri)
      );
    }
  }

  function learnMore(selector) {
    const target = document.querySelector(selector || "#my-quivrr-profile");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  async function handleCallback() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    if (!code || !state) {
      const session = getSession();
      if (session && session.expiresAt > Date.now()) {
        updateEntryState(session.profile);
      }
      return;
    }

    try {
      await exchangeCode(code, state);
    } catch (error) {
      clearSession();
      modal.hidden = false;
      showStep("providers");
      setStatus(isConfigured(authConfig()) ? "Sign-in could not be completed. Please try again." : signInDisabledMessage());
    }
  }

  function initGlobalApi() {
    window.QuivrrMyQuivrr = {
      isAuthenticated: isAuthenticated,
      open: openModal,
      saveBoard: saveBoard,
      addBoardToQuiver: addBoardToQuiver,
      trackEvent: postEvent,
      refresh: loadDashboard,
      getSessionProfile: function () {
        const session = getSession();
        return session ? session.profile : null;
      },
    };
  }

  async function handleClick(event) {
    const openTrigger = event.target.closest("[data-my-quivrr-open]");
    const learnTrigger = event.target.closest("[data-my-quivrr-learn]");
    const signInTrigger = event.target.closest("[data-my-quivrr-sign-in]");
    const openProfileButton = event.target.closest("[data-my-quivrr-open-profile]");
    const skipProfileButton = event.target.closest("[data-my-quivrr-skip-profile]");
    const saveProfileButton = event.target.closest("[data-my-quivrr-save-profile]");
    const editProfileButton = event.target.closest("[data-my-quivrr-edit-profile]");
    const logoutButton = event.target.closest("[data-my-quivrr-logout]");
    const addCustomBoardButton = event.target.closest("[data-my-quivrr-add-custom-board]");
    const saveQuiverButton = event.target.closest("[data-my-quivrr-save-quiver]");
    const cancelQuiverButton = event.target.closest("[data-my-quivrr-cancel-quiver]");
    const editQuiverButton = event.target.closest("[data-my-quivrr-edit-quiver]");
    const deleteQuiverButton = event.target.closest("[data-my-quivrr-delete-quiver]");
    const currentQuiverButton = event.target.closest("[data-my-quivrr-set-current]");
    const deleteSavedButton = event.target.closest("[data-my-quivrr-delete-saved]");
    const addSavedToQuiverButton = event.target.closest("[data-my-quivrr-add-saved-to-quiver]");
    const closeTrigger = event.target.closest(".my-quivrr-modal-backdrop, .my-quivrr-modal-close");

    if (openTrigger) {
      await openModal();
      return;
    }
    if (learnTrigger) {
      learnMore(learnTrigger.getAttribute("data-my-quivrr-learn"));
      return;
    }
    if (signInTrigger) {
      startSignIn();
      return;
    }
    if (openProfileButton) {
      openProfileEditor();
      return;
    }
    if (saveProfileButton) {
      await saveProfile();
      return;
    }
    if (editProfileButton) {
      showStep("profile");
      return;
    }
    if (addCustomBoardButton) {
      showStep("account");
      showQuiverEditor("add", { customBoard: true });
      setStatus("Add your custom board details and save them to your quiver.");
      return;
    }
    if (saveQuiverButton) {
      await saveQuiverItem();
      return;
    }
    if (cancelQuiverButton) {
      hideQuiverEditor();
      return;
    }
    if (editQuiverButton) {
      const item = currentDashboardState().quiver.find(function (quiverItem) {
        return quiverItem.quiverId === editQuiverButton.getAttribute("data-my-quivrr-edit-quiver");
      });
      showQuiverEditor("edit", item);
      return;
    }
    if (deleteQuiverButton) {
      await deleteQuiverItem(deleteQuiverButton.getAttribute("data-my-quivrr-delete-quiver"));
      return;
    }
    if (currentQuiverButton) {
      await setCurrentBoard(currentQuiverButton.getAttribute("data-my-quivrr-set-current"));
      return;
    }
    if (deleteSavedButton) {
      await deleteSavedBoard(deleteSavedButton.getAttribute("data-my-quivrr-delete-saved"));
      return;
    }
    if (addSavedToQuiverButton) {
      addSavedBoardToQuiver(addSavedToQuiverButton.getAttribute("data-my-quivrr-add-saved-to-quiver"));
      return;
    }
    if (skipProfileButton) {
      await skipProfile(skipProfileButton.getAttribute("data-my-quivrr-skip-profile"));
      return;
    }
    const clearFieldButton = event.target.closest("[data-my-quivrr-clear-field]");
    if (clearFieldButton) {
      var fieldName = clearFieldButton.getAttribute("data-my-quivrr-clear-field");
      var field = profileForm.elements[fieldName];
      if (field) {
        field.value = "";
        pendingProfileClears.add(fieldName);
      }
      return;
    }
    if (logoutButton) {
      await logout();
      return;
    }
    if (closeTrigger) {
      closeModal();
    }
  }

  function init() {
    mountEntryButton();
    mountClearButtons();
    initGlobalApi();
    document.addEventListener("click", function (event) {
      handleClick(event);
    });
    profileForm.addEventListener("input", function (event) {
      if (event.target && event.target.name) {
        pendingProfileClears.delete(event.target.name);
      }
    });
    profileForm.addEventListener("change", function (event) {
      if (event.target && event.target.name) {
        pendingProfileClears.delete(event.target.name);
      }
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !modal.hidden) {
        closeModal();
      }
    });
    handleCallback();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
