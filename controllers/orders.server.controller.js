'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
     errorHandler = require('./errors.server.controller'),
     Order = mongoose.model('Order'),
     _ = require('lodash');

/**
 * Create a Order
 */
exports.create = function(req, res) {
     var order = new Order(req.body);

     order.save(function(err) {
          if (err) {
               return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
               });
          } else {
               res.jsonp(order);
          }
     });
};

/**
* Update a Order
*/
exports.updateOrder = function(req, res, next) {
     var id = req.orderId;
     Order.findById(id, '-__v', function (err, order) {
          if(err) res.status(404).json({message: 'order not found'});
          var updated = _.extend(order, req.body);
          updated.save(function (err, upd) {
               if(err) {
                    res.status(500).json({message: 'error updating order'});
               } else {
                    res.status(200).json(upd);
               }
          })
     })

};

/**
* Delete an Order
*/
exports.deleteOrder = function(req, res) {
     var id = req.orderId;
     console.log('id', id);
     Order.findOneAndRemove({_id:id}, function (err) {
          if(err){
               res.status(500).json({message: 'something went wrong'});
          } else {
               res.status(204).json({message: 'successfully deleted order'});
          }
     });

};

/**
* List of Orders
*/
exports.list = function(req, res) {
     //Order.findByIdAndUpdate(id,req.body)
     Order.find().sort('-created').populate('user', 'displayName').exec(function(err, clients) {
          if (err) {
               return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
               });
          } else {
               res.jsonp(clients);
          }
     });
};

/**
* Order by ID
*/
exports.orderByID = function(req, res) {
     var id = req.orderId;
     Order.findById(id, function (err, order) {
          if(err) res.status(404).json({message: 'order not found'});
          res.status(200).json(order);
     })

};

/**
 * Page authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
    if (req.user.role === 'team') {
        return res.status(403).send('User is not authorized');
    }
    next();
};
