window.QUIVRR_AUTH_CONFIG = window.QUIVRR_AUTH_CONFIG || {
  enabled: false,
  authority: "",
  clientId: "",
  redirectUri: "",
  postLogoutRedirectUri: "",
  scopes: ["openid", "profile", "email"],
  apiBaseUrl: "https://quivrr-backend-api.azurewebsites.net",
  providers: {
    google: { enabled: false, authorizeUrl: "", message: "Google sign-in is being enabled." },
    apple: { enabled: false, authorizeUrl: "", message: "Apple sign-in is being enabled." },
    email: { enabled: false, authorizeUrl: "", message: "Email sign-in is being enabled." },
    microsoft: { enabled: false, authorizeUrl: "", message: "Microsoft sign-in is being enabled." },
  },
};
