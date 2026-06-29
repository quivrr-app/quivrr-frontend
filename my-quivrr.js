(function () {
  const body = document.body;

  function mountEntryButton() {
    const mount = document.querySelector(".hero-header-actions");
    if (!mount || mount.querySelector("[data-my-quivrr-open]")) {
      return;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "my-quivrr-entry";
    button.setAttribute("data-my-quivrr-open", "true");
    button.setAttribute("aria-label", "Open My Quivrr sign in preview");
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
      '    <h2 id="myQuivrrTitle">Sign in later, search now.</h2>',
      '    <p>You can browse Quivrr without logging in. A future profile will unlock saved boards, alerts, wishlists and more personalised Bodhi recommendations.</p>',
      '  </div>',
      '  <ul class="my-quivrr-benefits">',
      '    <li>Build your quiver</li>',
      '    <li>Save boards and wishlists</li>',
      '    <li>Get stock alerts</li>',
      '    <li>Help Bodhi recommend better boards</li>',
      '  </ul>',
      '  <section class="my-quivrr-step" data-my-quivrr-step="providers">',
      '    <div class="my-quivrr-step-label">Choose a future sign-in path</div>',
      '    <div class="my-quivrr-provider-grid">',
      '      <button type="button" class="my-quivrr-provider-button" data-provider="Google"><span>Continue with Google</span><span>Coming soon</span></button>',
      '      <button type="button" class="my-quivrr-provider-button" data-provider="Apple"><span>Continue with Apple</span><span>Coming soon</span></button>',
      '      <button type="button" class="my-quivrr-provider-button" data-provider="Facebook"><span>Continue with Facebook</span><span>Coming soon</span></button>',
      '      <button type="button" class="my-quivrr-provider-button" data-provider="Email"><span>Continue with Email</span><span>Coming soon</span></button>',
      '    </div>',
      '  </section>',
      '  <section class="my-quivrr-step" data-my-quivrr-step="profile" hidden>',
      '    <div class="my-quivrr-step-label">Complete your surfer profile</div>',
      '    <p>You can skip any of this. The more you share, the better Bodhi can help match boards to your surfing.</p>',
      '    <form class="my-quivrr-form-grid">',
      '      <label class="my-quivrr-form-field"><span>Display name</span><input type="text" autocomplete="off" /></label>',
      '      <label class="my-quivrr-form-field"><span>Home region</span><select><option value="">Choose a region</option><option>Australia</option><option>Indonesia</option><option>Europe</option><option>United States</option></select></label>',
      '      <label class="my-quivrr-form-field"><span>Location</span><input type="text" autocomplete="off" /></label>',
      '      <label class="my-quivrr-form-field"><span>Height</span><input type="text" autocomplete="off" /></label>',
      '      <label class="my-quivrr-form-field"><span>Weight</span><input type="text" autocomplete="off" /></label>',
      '      <label class="my-quivrr-form-field"><span>Preferred volume range</span><input type="text" autocomplete="off" /></label>',
      '      <label class="my-quivrr-form-field"><span>Skill level</span><input type="text" autocomplete="off" /></label>',
      '      <label class="my-quivrr-form-field"><span>Surf style</span><select><option value="">Choose a style</option><option>Cruisy</option><option>Performance</option><option>Power surfing</option><option>Fish / twin fin</option><option>Midlength</option><option>Step-up / bigger waves</option><option>Barrel / hollow waves</option><option>Top-to-bottom beach breaks</option><option>Point breaks</option><option>Reef breaks</option></select></label>',
      '      <label class="my-quivrr-form-field"><span>Common wave type</span><select><option value="">Choose a wave type</option><option>Beach break</option><option>Point break</option><option>Reef break</option><option>Small mushy waves</option><option>Fast hollow waves</option><option>Bigger open-face waves</option></select></label>',
      '      <label class="my-quivrr-form-field"><span>Favourite brands</span><input type="text" autocomplete="off" /></label>',
      '      <label class="my-quivrr-form-field"><span>Current board volume</span><input type="text" autocomplete="off" /></label>',
      '      <label class="my-quivrr-form-field full"><span>Notes</span><textarea></textarea></label>',
      '    </form>',
      '    <div class="my-quivrr-form-actions">',
      '      <button type="button" class="my-quivrr-modal-action secondary" data-my-quivrr-complete="later">Save profile later</button>',
      '      <button type="button" class="my-quivrr-modal-action" data-my-quivrr-complete="skip">Skip for now</button>',
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
  const status = modal.querySelector(".my-quivrr-modal-status");

  function openModal() {
    modal.hidden = false;
    providerStep.hidden = false;
    profileStep.hidden = true;
    status.textContent = "";
    body.style.overflow = "hidden";

    const firstButton = modal.querySelector(".my-quivrr-provider-button");
    if (firstButton) {
      firstButton.focus();
    }
  }

  function closeModal() {
    modal.hidden = true;
    body.style.overflow = "";
  }

  function handleClick(event) {
    const openTrigger = event.target.closest("[data-my-quivrr-open]");
    const providerButton = event.target.closest(".my-quivrr-provider-button");
    const completeButton = event.target.closest("[data-my-quivrr-complete]");
    const closeTrigger = event.target.closest(".my-quivrr-modal-backdrop, .my-quivrr-modal-close");

    if (openTrigger) {
      openModal();
      return;
    }

    if (providerButton) {
      providerStep.hidden = true;
      profileStep.hidden = false;
      status.textContent = providerButton.dataset.provider + " sign-in is mocked for now. Nothing here is connected to a live account yet.";
      const firstField = profileStep.querySelector("input, select, textarea");
      if (firstField) {
        firstField.focus();
      }
      return;
    }

    if (completeButton) {
      status.textContent = "Frontend-only preview. No profile data has been stored.";
      window.setTimeout(closeModal, 450);
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
