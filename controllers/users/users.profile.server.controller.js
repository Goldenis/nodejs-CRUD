'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller.js'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	Card = mongoose.model('Card'),
	User = mongoose.model('User');

/**
 * Update user details
 */
exports.update = function(req, res) {
	// Init Variables
	var user = req.user;
	var message = null;

	// For security measurement we remove the roles from the req.body object
	delete req.body.roles;

	if (user) {
		// Merge existing user
		user = _.extend(user, req.body);
		user.updated = Date.now();
		user.displayName = user.firstName + ' ' + user.lastName;

		user.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				req.login(user, function(err) {
					if (err) {
						res.status(400).send(err);
					} else {
						res.json(user);
					}
				});
			}
		});
	} else {
		res.status(400).send({
			message: 'User is not signed in'
		});
	}
};

/**
 * Send User
 */
exports.me = function(req, res) {
	res.json(req.user || null);
};

/**
 * Get all users
 * restriction: 'admin'
 */
exports.getAllUsers = function (req, res) {
     User.find({}, '-salt -password -__v', function (err, users) {
          if(err) return res.status(500).json(err);
          res.status(200).json(users);
     });
};

/**
 * Updates permissions
 * restriction: 'admin'
 */
exports.updatePermissions = function (req, res) {
     var userId = req.userId;
     User.findById(userId, '-salt -password -__v', function (err, user) {
          if(err) return res.status(500).json('error', err);
          user.permissions = req.body.permissions;
          if(req.body.role) {
               user.role = req.body.role;
          }
          user.save(function (err) {
               if (err) {
                    return res.status(500).json('error', err);
               } else {
                    res.status(200).json(user);
               }
          })
     });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.deleteUser = function (req, res) {
     var userId = req.userId;
     User.findByIdAndRemove(userId, function (err) {
          if(err) return res.status(500).json('error', err);
               res.status(204).json({status:'deleted'});
     });
};

/**
 * Changing password for user by ID
 * restriction: 'admin'
 */
exports.changeUserPassword = function (req, res) {
     User.findById(req.userId, function(err, user) {
          if(err) res.status(404).json({message: 'user not found'});
          user.password = req.body.newPassword;
          user.save(function (err) {
               if (err) return res.status(500).json('error', err);
               res.status(200).json({status:'changed'});
          })
     })
};

/**
 * Get single user by his ID
 * restriction: 'admin'
 */
exports.getUserById = function (req, res) {
     User.findById(req.userId, '-salt -password -__v', function(err, user) {
          if(err) res.status(404).json({message: 'user not found'});
               res.status(200).json(user);
     })
};

/**
 * update all user fields
 * restriction: 'admin'
 */
exports.updateUserData = function (req, res) {
     delete req.body.changed;
     User.findById(req.userId, '-salt -password -__v', function(err, user) {
          if(err) res.status(404).json({message: 'user not found'});
          var updated = _.extend(user, req.body);
          updated.save(function (err, upd) {
               if (err) return res.status(500).json('error', err);
               res.status(200).json(upd);
          })
     })
};

/**
 * get all users claimed cards
 * restriction: 'none'
 */
exports.getUserCards = function (req, res) {
     User.findById(req.userId, '-salt -password -__v', function (err, user) {
          //var validCards = returnValidCards(user.claimedCards);
          var validCards = returnAllCards(user.claimedCards);
          Card.find({'_id': { $in: validCards}}, function (err, cards) {
               if (err) return res.status(500).json('error', err);
               res.status(200).json(cards);
          })
     });
     function returnValidCards(arrayOfCards) {
          var result = [], now = new Date();
          for (var i = 0; i < arrayOfCards.length; i += 1) {
               if ((new Date(arrayOfCards[i].expireAt)).getTime() > (new Date(now)).getTime()){
                    result.push(arrayOfCards[i].claimedId);
               }
          }
          return result;
     }
     //returning all cards for now, until we define expiration flow
     function returnAllCards(arrayOfCards) {
          var result = [];
          for (var i = 0; i < arrayOfCards.length; i += 1) {
               result.push(arrayOfCards[i].claimedId);
          }
          return result;
     }

};

/**
 * Card authorization middleware
 */
exports.hasAdminRole = function(req, res, next) {
     if(req.user.role && req.user.role !== 'admin'){
          res.status(403).json({message: 'You need admin permissions'})
     } else {
          next();
     }
};
