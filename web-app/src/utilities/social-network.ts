import { config } from '../config';

let isFaceBookSDKInitialized = false;

export const initFaceBookSDK = () => {
  if (!isFaceBookSDKInitialized) {
    (window as any).fbAsyncInit = () => {
      (window as any).FB.init({
        appId: config.facebookAppId,
        cookie: true,
        xfbml: true,
        version: 'v3.2',
      });
      isFaceBookSDKInitialized = true;
      (window as any).FB.AppEvents.logPageView();
    };

    init(document, 'script', 'facebook-jssdk', 'https://connect.facebook.net/en_US/sdk.js');
  }
};

export const initGoogleSDK = () => {
  init(document, 'script', 'google-jssdk', 'https://apis.google.com/js/platform.js');
};

// for v3
export const initGoogleRecaptcha = () => {
  init(
    document,
    'script',
    'google-recaptcha',
    `https://www.recaptcha.net/recaptcha/api.js?render=${config.googleRecaptchaKey}`,
  );
};

export const getGoogleRecaptchaToken = () => {
  return new Promise<string>((resolve, reject) => {
    const grecaptcha = (window as any).grecaptcha;
    grecaptcha.ready(() => {
      grecaptcha
        .execute(config.googleRecaptchaKey, {
          action: 'register',
        })
        .then((token: any) => {
          resolve(token);
        });
    });
  });
};

const init = (d: any, s: string, id: string, src: string) => {
  let js: any = d.getElementsByTagName(s)[0];
  const fjs: any = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {
    return;
  }
  js = d.createElement(s);
  js.id = id;
  js.src = src;
  fjs.parentNode.insertBefore(js, fjs);
};
