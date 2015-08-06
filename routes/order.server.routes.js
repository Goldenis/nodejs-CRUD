'use strict';

module.exports = function(app) {
     var users = require('../../app/controllers/users.server.controller');
     var clients = require('../../app/controllers/clients.server.controller');
     var orders = require('../../app/controllers/orders.server.controller');

     app.param('orderId', function(req, res, next, orderId) {
          req.orderId = orderId;
          next();
     });

     // Orders Routes
     app.route('/orders')
          .get(orders.list)
          .post(users.requiresLogin, orders.hasAuthorization, orders.create);

     app.route('/orders/:orderId')
          .get(orders.orderByID)
          .put(users.requiresLogin, orders.hasAuthorization, orders.updateOrder)
          .delete(users.requiresLogin, orders.hasAuthorization, orders.deleteOrder);

};
