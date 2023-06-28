'use strict';
const Boom = require('@hapi/boom');

const UtilsFunc = require('../utils/utils-func');
const accountService = require('../services/account');
const homeMadeInnService = require('../services/home-made-inn');
const appConfigService = require('../services/app-config');
const security = require('../services/security');
const usersMemCacheService = require('../services/users-mem-cache');
const CONSTANT = require('../utils/constant');

const APIs = {
  LOGIN: '/account/login',
  REGISTER: '/account/register',
  STORE_REGISTER: '/store/register',
  REGISTER_HOOK: '/account/register-hook-x',
  REGISTER_WITH_SINGLE_SIGN_IN: '/account/register-x/{oauth2Type}',
  VERIFY_EMAIL: '/account/verify-email',
  SEND_FORGOT_PASSWORD: '/account/forgot-password',
  GET_EMAIL_FROM_FORGOT_PASSWORD_TOKEN: '/account/get-email-from-forgot-password-token',
  CHANGE_PASSWORD_WITH_FORGOT_TOKEN: '/account/change-password',
  UPDATE_PASSWORD: '/account/update-password',
  SEARCH_ACCOUNT: '/account/search',
  UPDATE_PROFILE_IMAGE: '/account/profileImage',
  ACTIVATE_ACCOUNT: '/account/activate',
  UPDATE_USER_ID: '/account/update-user-id',
  GET_USER_ID_SUGGESTION: '/account/get-userid-suggestion',
  VERIFY_GOOGLE_CAPTCHA: '/account/verify-google-captcha',
  GENERATE_GOOGLE_TWO_FA_KEY: '/account/generate-g2fa-key',
  STORE_GOOGLE_TWO_FA_KEY: '/account/store-g2fa-key',
  TURN_OFF_GOOGLE_TWO_FA: '/account/turn-off-g2fa',
  CHECK_GOOGLE_TWO_FA: '/account/check-g2fa',
  UPDATE_EMAIL_SETTING: '/account/email-setting',
  SOCIAL: '/account/social',
  SOCIAL_UNAUTHORIZE: '/account/social/unauthorize/{social}',
  UPDATE_USER_BIOMETRIC: '/account/update-biometric',
  ACCOUNT_INFO: '/account/info',
};

module.exports = {
  name: 'routes-account',
  version: '1.0.0',
  register: (server) => {
    server.route({
      method: 'POST',
      path: APIs.LOGIN,
      handler: (request) => {
        const email = request.payload.email.toLowerCase();
        const password = request.payload.password;
        const twoFACode = request.payload.twoFACode || '';
        const clientInfo = UtilsFunc.getClientInfo(request);
        return accountService.login({
          emailOrUsername: email,
          password,
          twoFACode,
          clientInfo,
          isVerifyRequired: true,
        });
      },
    });

    server.route({
      method: 'POST',
      path: APIs.VERIFY_EMAIL,
      handler: async (request) => {
        if (process.env.NODE_ENV !== 'development' && request.payload.token) {
          await accountService.verifyGoogleRecaptcha(request.payload.token);
        }

        const email = request.payload.email.trim().toLowerCase();
        return accountService.verifyRegistrationEmail(email);
      },
    });

    server.route({
      method: 'POST',
      path: APIs.REGISTER,
      handler: async (request) => {
        const error = accountService.validateRegistrationInfo(request);
        const clientInfo = UtilsFunc.getClientInfo(request);
        if (error) {
          return Boom.badRequest(error.message);
        }
        const email = request.payload.email.toLowerCase(); // TODO validate the case which mail includes many dots but same name ex: abc, a.b.c, a.bc
        const userData = await accountService.register({
          ...request.payload,
          email,
          createBySystem: false,
          clientInfo,
        });
        if (userData._id) {
          await homeMadeInnService.createUser({id: userData._id})
        }
        return userData;
      },
    });

    server.route({
      method: 'POST',
      path: APIs.STORE_REGISTER,
      handler: async (request) => {
        const error = accountService.validateRegistrationInfo(request);
        const clientInfo = UtilsFunc.getClientInfo(request);
        if (error) {
          return Boom.badRequest(error.message);
        }
        const email = request.payload.email.toLowerCase(); // TODO validate the case which mail includes many dots but same name ex: abc, a.b.c, a.bc
        const userData = await accountService.register({
          ...request.payload,
          email,
          createBySystem: false,
          clientInfo,
          isChef: true,
        });

        if (userData._id) {
          await homeMadeInnService.createUser({id: userData._id});
          const store = await homeMadeInnService.createStore({
              userId: userData._id,
              name: request.payload.storeName,
              address: request.payload.storeAddress,
              phone: request.payload.storePhone,
          });
          await accountService.updateAccountInfo(userData._id, {storeId: store.id});
        }
        
        return userData;
      },
    });

    server.route({
      method: 'POST',
      path: APIs.REGISTER_HOOK,
      handler: async (request) => {
        const error = accountService.validateRegistrationInfo(request);
        if (error) {
          return Boom.badRequest(error.message);
        }
        request.payload.email = request.payload.email.toLowerCase();
        request.payload.country = UtilsFunc.getCountryCodeByName(request.payload.country);
        const userData = await accountService.register({
          ...request.payload,
          createdByHook: true,
          createBySystem: false,
        });
        return userData;
      },
    });

    server.route({
      method: 'POST',
      path: APIs.REGISTER_WITH_SINGLE_SIGN_IN,
      handler: async (request) => {
        const clientInfo = UtilsFunc.getClientInfo(request);
        const userData = await accountService.registerSingleSignIn(
          request.params.oauth2Type,
          request.payload.token,
          request.payload.country,
          clientInfo,
          request.payload.acceptTermsAt,
          request.payload.acceptAgreementAt,
        );

        return userData;
      },
    });

    server.route({
      method: 'POST',
      path: APIs.SEND_FORGOT_PASSWORD,
      handler: async (request) => {
        await accountService.verifyGoogleRecaptcha(request.payload.token);

        const email = request.payload.email.trim().toLowerCase();
        return accountService.sendForgotPasswordEmail(email);
      },
    });

    server.route({
      method: 'POST',
      path: APIs.GET_EMAIL_FROM_FORGOT_PASSWORD_TOKEN,
      handler: async (request) => {
        return accountService.getEmailFromForgotPasswordToken(request.payload.token);
      },
    });

    server.route({
      method: 'POST',
      path: APIs.CHANGE_PASSWORD_WITH_FORGOT_TOKEN,
      handler: async (request) => {
        const user = await accountService.changePassword(request.payload.token, request.payload.password);
        return accountService.login({
          emailOrUsername: user.email,
          password: request.payload.password,
          twoFACode: '',
          clientInfo: UtilsFunc.getClientInfo(request),
          isVerifyRequired: true,
        });
      },
    });

    server.route({
      method: 'GET',
      path: APIs.SEARCH_ACCOUNT,
      config: {
        auth: 'jwt',
      },
      handler: async (request) => {
        return usersMemCacheService.searchUsersByText(
          request.query.value,
          request.query.activeOnly === 'true',
          request.query.fields,
        );
      },
    });

    server.route({
      method: 'PUT',
      path: APIs.UPDATE_PASSWORD,
      config: {
        auth: 'jwt',
      },
      handler: async (request) => {
        return accountService.updatePassword(
          request.user.id,
          request.payload.oldPassword,
          request.payload.newPassword,
          request.payload.twoFACode,
        );
      },
    });

    server.route({
      method: 'POST',
      path: APIs.UPDATE_PROFILE_IMAGE,
      options: {
        auth: 'jwt',
        payload: {
          output: 'stream',
          multipart: true,
        },
      },
      handler: async (request) => {
        return accountService.updateProfileImage(request.user.id, request.payload.profileImage);
      },
    });

    server.route({
      method: 'PUT',
      path: APIs.ACTIVATE_ACCOUNT,
      handler: async (request) => {
        const clientInfo = UtilsFunc.getClientInfo(request);
        const user = await accountService.activateAccountByCode(request.payload.code, clientInfo);
        const decodeUser = security.decodeJWT(user.token);
       
        return user;
      },
    });

    server.route({
      method: 'PUT',
      path: APIs.UPDATE_USER_ID,
      config: {
        auth: 'jwt',
      },
      handler: (request) => {
        const userId = request.user.id;
        return accountService.updateUsername(userId, request.payload.username);
      },
    });
    
    server.route({
      method: 'GET',
      path: APIs.GET_USER_ID_SUGGESTION,
      handler: async (request) => {
        try {
          return await accountService.getSuggestUsername(request.query.username);
        } catch (error) {
          return Boom.badImplementation(error.message);
        }
      },
    });

    server.route({
      method: 'GET',
      path: APIs.GENERATE_GOOGLE_TWO_FA_KEY,
      config: {
        auth: 'jwt',
      },
      handler: (request) => {
        return accountService.generateGoogleTwoFAKey();
      },
    });

    server.route({
      method: 'POST',
      path: APIs.STORE_GOOGLE_TWO_FA_KEY,
      config: {
        auth: 'jwt',
      },
      handler: (request) => {
        const userId = request.user.id;
        const password = request.payload.password;
        const twoFAKey = request.payload.twoFAKey;
        const twoFACode = request.payload.twoFACode;
        const isFromThirdParty = request.payload.isFromThirdParty || false;
        return accountService.storeGoogleTwoFAKey(userId, password, twoFAKey, twoFACode, isFromThirdParty);
      },
    });

    server.route({
      method: 'POST',
      path: APIs.TURN_OFF_GOOGLE_TWO_FA,
      config: {
        auth: 'jwt',
      },
      handler: (request) => {
        const userId = request.user.id;
        const twoFACode = request.payload.twoFACode;
        return accountService.turnOffGoogleTwoFA(userId, twoFACode);
      },
    });

    server.route({
      method: 'POST',
      path: APIs.CHECK_GOOGLE_TWO_FA,
      config: {
        auth: 'jwt',
      },
      handler: (request) => {
        const userId = request.user.id;
        const twoFACode = request.payload.twoFACode;
        return accountService.checkGoogleTwoFACode(userId, twoFACode);
      },
    });

    server.route({
      method: 'PUT',
      path: APIs.UPDATE_EMAIL_SETTING,
      config: {
        auth: 'jwt',
      },
      handler: async (request) => {
        await accountService.updateEmailSetting(request.user.id, request.payload);
        return { message: 'ok' };
      },
    });

    server.route({
      method: 'PUT',
      path: APIs.UPDATE_USER_BIOMETRIC,
      config: {
        auth: 'jwt',
      },
      handler: async (request) => {
        await accountService.updateUserBiometric(request.user.id, request.payload.isBiometric);
        return { message: 'ok' };
      },
    });

    server.route({
      method: 'GET',
      path: APIs.SOCIAL,
      config: {
        auth: 'jwt',
      },
      handler: async (request) => {
        const social = await accountService.getSocial(request.user.id);
        if (!UtilsFunc.getValueByPath(social, 'telegram.authorized')) {
          const appSocialSetting = await appConfigService.getAppConfigByKey(CONSTANT.KEY_CONFIG.SOCIAL_SETTING);
          if (UtilsFunc.getValueByPath(appSocialSetting, 'telegram.botName')) {
            if (social && !social.telegram) {
              social.telegram = {};
            }
            social.telegram.botName = appSocialSetting.telegram.botName;
          }
        }
        return social;
      },
    });

    server.route({
      method: 'POST',
      path: APIs.SOCIAL_UNAUTHORIZE,
      config: {
        auth: 'jwt',
      },
      handler: (request) => {
        return accountService.unauthorizeSocial(request.user.id, request.params.social);
      },
    });

    server.route({
      method: 'PUT',
      config: {
        auth: 'jwt',
      },
      path: APIs.ACCOUNT_INFO,
      handler: async (request) => {
        return accountService.updateAccountInfo(
          request.user.id,
          request.payload
        );
      },
    });

    server.route({
      method: 'GET',
      config: {
        auth: 'jwt',
      },
      path: APIs.ACCOUNT_INFO,
      handler: async (request) => {
        return accountService.getAccountInfo(request.user.id, request.query);
      },
    });

    server.route({
      method: 'GET',
      config: {
        auth: 'jwt',
      },
      path: `${APIs.ACCOUNT_INFO}/{id}`,
      handler: async (request) => {
        return accountService.getAccountInfo(request.params.id);
      },
    });
  },
};
