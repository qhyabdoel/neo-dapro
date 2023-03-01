// const host = process.env.REACT_APP_PQUI_HOST;
const localhost = "localhost:4200";
const hostname = "http://studio.paques.id:81";
const host_auth = "https://auth.paques.dev";
const host_pcc = "http://studio.paques.id:8585";

export const HOST = {
  HOSTNAME: hostname,
  HOST_LOCAL: localhost,
  HOST_AUTH: host_auth,
  HOST_PCC: host_pcc,
  API_HOST: window.location.origin,

  REST_PCC_CLAIM_TOKEN: `${host_pcc}/api/token`,
  REST_PCC_VERSION: `${host_pcc}/api/version`,

  REST_AUTH_LOGIN: `${host_auth}/api/v1/auth/provider/signin`,
  REST_AUTH_LOGOUT: `${host_auth}/api/v1/signout`,
  REST_AUTH_REDEEM_SESSION_TOKEN: `${host_auth}/api/v1/auth/provider/session/redeem`,
  REST_AUTH_REFRESH_TOKEN: `${host_auth}/api/v1/auth/provider/refresh-token`,
};
