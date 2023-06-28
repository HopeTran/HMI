const { MTProto } = require('@mtproto/core');
const { sleep } = require('@mtproto/core/src/utils/common');

async function fetchRecentChannelParticipants(appId, appHash, botToken, channel) {
  const mtproto = new MTProto({
    api_id: appId,
    api_hash: appHash,
  });
  mtproto.updateInitConnectionParams({ app_version: '10.0.0' });

  // Sign in as bot
  await callApi(mtproto, 'auth.importBotAuthorization', {
    flags: 0,
    api_id: appId,
    api_hash: appHash,
    bot_auth_token: botToken,
  });

  // Get channel info
  const entity = await callApi(mtproto, 'contacts.resolveUsername', {
    username: channel,
  });

  channel = entity.chats.find((item) => item.username === channel);

  // Get participants
  const channelParticipants = await callApi(mtproto, 'channels.getParticipants', {
    channel: {
      _: 'inputChannel',
      channel_id: channel.id,
      access_hash: channel.access_hash,
    },
    filter: {
      _: 'channelParticipantsRecent',
    },
    offset: 0,
    limit: 200,
    hash: 0,
  });

  return channelParticipants.users;
}

function callApi(mtproto, method, params, options = {}) {
  return mtproto.call(method, params, options).catch(async (error) => {
    // eslint-disable-next-line camelcase
    const { error_code, error_message } = error;

    // eslint-disable-next-line camelcase
    if (error_code === 420) {
      const seconds = +error_message.split('FLOOD_WAIT_')[1];
      const ms = seconds * 1000;

      await sleep(ms);

      return mtproto.call(method, params, options);
    }

    // eslint-disable-next-line camelcase
    if (error_code === 303) {
      const [type, dcId] = error_message.split('_MIGRATE_');

      // If auth.sendCode call on incorrect DC need change default DC, because call auth.signIn on incorrect DC return PHONE_CODE_EXPIRED error
      if (type === 'PHONE') {
        await mtproto.setDefaultDc(+dcId);
      } else {
        options = {
          ...options,
          dcId: +dcId,
        };
      }

      return mtproto.call(method, params, options);
    }

    return Promise.reject(error);
  });
}

module.exports = {
  fetchRecentChannelParticipants,
};
