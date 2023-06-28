module.exports = {
  name: 'routes-static-files',
  version: '1.0.0',
  register: server => {

    server.route({
      method: 'GET',
      path: '/uploads/{param*}',
      handler: {
          directory: {
              path: './uploads'
          }
      }
  });
  },
};
