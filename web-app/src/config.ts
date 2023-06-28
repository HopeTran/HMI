class Setting {
  env: string;
  apiServerUrl: string;
  imageServerUrl: string;
  facebookAppId: string;
  googleRecaptchaKey: string;
  googleMapApiKey: string;
  intervalReloadUserOrder: number;
  intervalReloadInventory: number;

  constructor() {
    this.env = process.env.REACT_APP_ENV || EMPTY;
    this.apiServerUrl = process.env.REACT_APP_API_URL || EMPTY;
    this.imageServerUrl = process.env.REACT_APP_IMAGE_SERVER_URL || EMPTY;
    this.facebookAppId = process.env.REACT_APP_FACEBOOK_APP_ID || EMPTY;
    this.googleRecaptchaKey = process.env.REACT_APP_GOOGLE_RECAPTCHA_KEY || EMPTY;
    this.googleMapApiKey = process.env.REACT_APP_GOOGLE_MAP_API_KEY || EMPTY;
    this.intervalReloadUserOrder = Number(process.env.REACT_APP_INTERVAL_RELOAD_USER_ORDER) || 20;
    this.intervalReloadInventory = Number(process.env.REACT_APP_INTERVAL_RELOAD_INVENTORY) || 10;
  }
}

const EMPTY: string = '';

const config: Setting = new Setting();

(window as any).version = process.env.REACT_APP_GIT_COMMIT;

export { Setting, config };
