(function () {
  var currentRedirectUri = window.location.origin + window.location.pathname;

  window.QUIVRR_AUTH_CONFIG = window.QUIVRR_AUTH_CONFIG || {
    enabled: true,
    authority: "https://quivrrauthclean.ciamlogin.com/69dd1b9b-5a2c-4119-940e-fd70d628026b",
    openIdConfigurationUrl: "https://quivrrauthclean.ciamlogin.com/quivrrauthclean.onmicrosoft.com/v2.0/.well-known/openid-configuration?appid=0484ac77-9c3f-41f5-a78e-0b0045a153de",
    authorizationEndpoint: "https://quivrrauthclean.ciamlogin.com/69dd1b9b-5a2c-4119-940e-fd70d628026b/oauth2/v2.0/authorize",
    tokenEndpoint: "https://quivrrauthclean.ciamlogin.com/69dd1b9b-5a2c-4119-940e-fd70d628026b/oauth2/v2.0/token",
    logoutEndpoint: "https://quivrrauthclean.ciamlogin.com/69dd1b9b-5a2c-4119-940e-fd70d628026b/oauth2/v2.0/logout",
    clientId: "0484ac77-9c3f-41f5-a78e-0b0045a153de",
    redirectUri: currentRedirectUri,
    postLogoutRedirectUri: currentRedirectUri,
    scopes: ["openid", "profile", "email", "offline_access"],
    apiBaseUrl: "https://quivrr-backend-api.azurewebsites.net",
    providers: {
      google: {
        enabled: true,
        authorizeUrl: "",
        queryParameters: {
          domain_hint: "google.com",
          prompt: "select_account",
        },
        message: "",
      },
      apple: { enabled: false, authorizeUrl: "", message: "Apple sign-in is being enabled." },
      email: {
        enabled: true,
        authorizeUrl: "",
        queryParameters: {
          prompt: "create",
        },
        message: "",
      },
      microsoft: {
        enabled: true,
        authorizeUrl: "",
        queryParameters: {
          domain_hint: "login.live.com",
          prompt: "select_account",
        },
        message: "",
      },
    },
  };
})();
