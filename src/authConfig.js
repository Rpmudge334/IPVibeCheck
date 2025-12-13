export const msalConfig = {
    auth: {
        clientId: "278fa4c1-dec7-4ac9-915f-c042641c5295",
        authority: "https://login.microsoftonline.com/dcf921d4-f0f5-4e7c-bee9-7faea39b41ed",
        redirectUri: window.location.origin,
    },
    cache: {
        cacheLocation: "sessionStorage", // This configures where your cache will be stored
        storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    },
};

export const loginRequest = {
    scopes: ["User.Read"],
};
