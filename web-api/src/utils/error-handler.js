const Boom = require('@hapi/boom');
const httpStatus = require('http-status');

module.exports = {
  throwBoom,
};

function throwBoom(error) {
  if (error.response) {
    const { message, data } = error.response.data;
    switch (error.response.status) {
      case httpStatus.BAD_REQUEST:
        throw Boom.badRequest(message, data);
      case httpStatus.NOT_FOUND:
        throw Boom.notFound(message, data);
      case httpStatus.CONFLICT:
        throw Boom.conflict(message, data);
      case httpStatus.UNPROCESSABLE_ENTITY:
        throw Boom.badData(message, data);
      default:
        throw Boom.badImplementation(message, data);
    }
  }

  if (error.isBoom) {
    throw error;
  }

  throw Boom.badImplementation(error.message);
}
