(function () {
  const body = document.body;
  const STORAGE_KEY = "quivrrAuthSession";
  const PKCE_KEY = "quivrrAuthPkce";
  const DEFAULT_API_BASE = "https://quivrr-backend-api.azurewebsites.net";

  function authConfig() {
    const configured = window.QUIVRR_AUTH_CONFIG || {};
    return {
      clientId: configured.clientId || "",
      authority: (configured.authority || "").replace(/\/$/, ""),
      redirectUri: configured.redirectUri || window.location.href.split("#")[0].split("?")[0],
      scopes: configured.scopes || ["openid", "profile", "email"],
      apiBaseUrl: (configured.apiBaseUrl || DEFAULT_API_BASE).replace(/\/$/, ""),
      postLogoutRedirectUri: configured.postLogoutRedirectUri || window.location.origin + "/",
    };
  }

  function isConfigured(config) {
    return Boolean(config.clientId && config.authority);
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
    button.setAttribute("aria-label", "Open My Quivrr sign in");
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
      '    <p>Search stays open without login. Signing in creates your Quivrr identity and lets you complete an optional surf profile.</p>',
      '  </div>',
      '  <ul class="my-quivrr-benefits">',
      '    <li>One Quivrr identity</li>',
      '    <li>Email, Google, Microsoft and Apple-ready</li>',
      '    <li>Optional surfer profile</li>',
      '    <li>Public search remains open</li>',
      '  </ul>',
      '  <section class="my-quivrr-step" data-my-quivrr-step="providers">',
      '    <div class="my-quivrr-step-label">Secure sign in</div>',
      '    <div class="my-quivrr-provider-grid">',
      '      <button type="button" class="my-quivrr-provider-button" data-my-quivrr-sign-in><span>Continue with My Quivrr</span><span>Microsoft Entra External ID</span></button>',
      '    </div>',
      '    <p class="my-quivrr-modal-note">Your identity provider is selected in the secure Microsoft sign-in flow.</p>',
      '  </section>',
      '  <section class="my-quivrr-step" data-my-quivrr-step="profile" hidden>',
      '    <div class="my-quivrr-step-label">Complete your profile</div>',
      '    <p>Everything here is optional. Skip now and finish later whenever you like.</p>',
      '    <form class="my-quivrr-form-grid" data-my-quivrr-profile-form>',
      '      <label class="my-quivrr-form-field"><span>Display name</span><input name="displayName" type="text" autocomplete="name" /></label>',
      '      <label class="my-quivrr-form-field"><span>Home region</span><select name="homeRegion"><option value="">Choose a region</option><option value="AU">Australia</option><option value="ID">Indonesia</option><option value="EU">Europe</option><option value="US">United States</option></select></label>',
      '      <label class="my-quivrr-form-field"><span>Home break</span><input name="homeBreak" type="text" autocomplete="off" /></label>',
      '      <label class="my-quivrr-form-field"><span>Home country</span><input name="homeCountry" type="text" autocomplete="country-name" /></label>',
      '      <label class="my-quivrr-form-field"><span>Height cm</span><input name="heightCm" type="number" inputmode="numeric" /></label>',
      '      <label class="my-quivrr-form-field"><span>Weight kg</span><input name="weightKg" type="number" inputmode="numeric" /></label>',
      '      <label class="my-quivrr-form-field"><span>Skill level</span><input name="ability" type="text" autocomplete="off" /></label>',
      '      <label class="my-quivrr-form-field"><span>Common wave type</span><input name="waveType" type="text" autocomplete="off" /></label>',
      '      <label class="my-quivrr-form-field"><span>Favourite brands</span><input name="preferredBrands" type="text" autocomplete="off" /></label>',
      '      <label class="my-quivrr-form-field"><span>Current board volume</span><input name="currentVolumeLitres" type="number" step="0.1" inputmode="decimal" /></label>',
      '    </form>',
      '    <div class="my-quivrr-form-actions">',
      '      <button type="button" class="my-quivrr-modal-action secondary" data-my-quivrr-complete="later">Finish later</button>',
      '      <button type="button" class="my-quivrr-modal-action secondary" data-my-quivrr-complete="skip">Skip for now</button>',
      '      <button type="button" class="my-quivrr-modal-action" data-my-quivrr-save-profile>Save profile</button>',
      '    </div>',
      '  </section>',
      '  <section class="my-quivrr-step" data-my-quivrr-step="account" hidden>',
      '    <div class="my-quivrr-step-label">Signed in</div>',
      '    <p data-my-quivrr-account-summary>Your My Quivrr identity is active.</p>',
      '    <div class="my-quivrr-form-actions">',
      '      <button type="button" class="my-quivrr-modal-action secondary" data-my-quivrr-edit-profile>Edit profile</button>',
      '      <button type="button" class="my-quivrr-modal-action" data-my-quivrr-logout>Log out</button>',
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

  function setStatus(message) {
    status.textContent = message || "";
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

  function updateEntryState(profile) {
    const triggers = document.querySelectorAll("[data-my-quivrr-open]");
    triggers.forEach(function (trigger) {
      const strong = trigger.querySelector("strong");
      if (strong) {
        strong.textContent = profile && profile.user ? "Signed in" : "Sign in";
      }
    });
  }

  function showStep(step) {
    providerStep.hidden = step !== "providers";
    profileStep.hidden = step !== "profile";
    accountStep.hidden = step !== "account";
  }

  function openModal() {
    const session = getSession();
    modal.hidden = false;
    body.style.overflow = "hidden";
    setStatus("");
    if (session && session.profile) {
      showAccount(session.profile);
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

  function randomString(length) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, function (byte) {
      return ("0" + byte.toString(16)).slice(-2);
    }).join("");
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

  async function startSignIn() {
    const config = authConfig();
    if (!isConfigured(config)) {
      setStatus("My Quivrr sign-in is waiting for Entra External ID frontend configuration.");
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

    const profile = await callApi("/api/me", accessToken);
    setSession({
      accessToken: accessToken,
      expiresAt: Date.now() + ((token.expires_in || 3600) * 1000),
      profile: profile,
    });
    sessionStorage.removeItem(PKCE_KEY);
    updateEntryState(profile);
    window.history.replaceState({}, document.title, pkce.returnTo || window.location.pathname);
    if (!profile.profileComplete) {
      modal.hidden = false;
      showStep("profile");
      setStatus("Signed in. Complete your profile now or skip it for later.");
    }
  }

  async function callApi(path, accessToken, options) {
    const config = authConfig();
    const response = await fetch(config.apiBaseUrl + path, {
      method: options && options.method ? options.method : "GET",
      headers: {
        "Authorization": "Bearer " + accessToken,
        "Content-Type": "application/json",
      },
      body: options && options.body ? JSON.stringify(options.body) : undefined,
    });
    if (!response.ok) {
      throw new Error("My Quivrr API request failed.");
    }
    return response.json();
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
    return payload;
  }

  async function saveProfile() {
    const session = getSession();
    if (!session || !session.accessToken) {
      setStatus("Please sign in before saving your profile.");
      return;
    }
    try {
      const profile = await callApi("/api/my-quivrr/profile", session.accessToken, {
        method: "PUT",
        body: profilePayload(),
      });
      setSession({ ...session, profile: profile });
      updateEntryState(profile);
      showAccount(profile);
      setStatus("Profile saved.");
    } catch (error) {
      setStatus("Profile could not be saved yet. Please try again.");
    }
  }

  function showAccount(profile) {
    showStep("account");
    const user = profile && profile.user ? profile.user : {};
    accountSummary.textContent = user.email
      ? "Signed in as " + user.email + "."
      : "Your My Quivrr identity is active.";
  }

  async function logout() {
    const config = authConfig();
    const session = getSession();
    if (session && session.accessToken) {
      try {
        await callApi("/api/logout", session.accessToken, { method: "POST" });
      } catch (error) {
        // Client session clearing is still safe if the stateless logout ping fails.
      }
    }
    clearSession();
    updateEntryState(null);
    closeModal();
    if (isConfigured(config)) {
      window.location.assign(config.authority + "/oauth2/v2.0/logout?post_logout_redirect_uri=" + encodeURIComponent(config.postLogoutRedirectUri));
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
      setStatus("Sign-in could not be completed. Please try again.");
    }
  }

  function handleClick(event) {
    const openTrigger = event.target.closest("[data-my-quivrr-open]");
    const learnTrigger = event.target.closest("[data-my-quivrr-learn]");
    const signInTrigger = event.target.closest("[data-my-quivrr-sign-in]");
    const completeButton = event.target.closest("[data-my-quivrr-complete]");
    const saveButton = event.target.closest("[data-my-quivrr-save-profile]");
    const editButton = event.target.closest("[data-my-quivrr-edit-profile]");
    const logoutButton = event.target.closest("[data-my-quivrr-logout]");
    const closeTrigger = event.target.closest(".my-quivrr-modal-backdrop, .my-quivrr-modal-close");

    if (openTrigger) {
      openModal();
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
    if (saveButton) {
      saveProfile();
      return;
    }
    if (editButton) {
      showStep("profile");
      return;
    }
    if (completeButton) {
      setStatus("No problem. Your profile can be finished later.");
      window.setTimeout(closeModal, 450);
      return;
    }
    if (logoutButton) {
      logout();
      return;
    }
    if (closeTrigger) {
      closeModal();
    }
  }

  function init() {
    mountEntryButton();
    document.addEventListener("click", handleClick);
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
