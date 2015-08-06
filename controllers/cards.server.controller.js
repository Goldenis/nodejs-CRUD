'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
     errorHandler = require('./errors.server.controller'),
     Card = mongoose.model('Card'),
     Mailgun = require('mailgun-js'),
     User = mongoose.model('User'),
//Client = mongoose.model('Client'),
     _ = require('lodash'),
     Q = require('q'),
     fs = require('fs'),
     mailService = require('../views/templates/mail.service.js'),
     path = require('path');

/**
 * Create a Card
 */
exports.create = function(req, res) {
	var card = new Card(req.body);
     card.user = req.user;
     //Client.findOne({companyName: req.body.client}, function (err, client) {
     //     card.client = client;
          card.save(function(err) {
               if (err) {
                    return res.status(400).send({
                         message: errorHandler.getErrorMessage(err)
                    });
               } else {
                    res.jsonp(card);
               }
          });
     //});
};

/**
 * Show the current Card
 */
exports.read = function(req, res) {
	res.jsonp(req.card);
};

/**
 * Update a Card
 */
exports.update = function(req, res) {
	var card = req.card ;

	card = _.extend(card , req.body);

	card.save(function(err, updcard) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
               //When : When status for any card goes to “client review”
               //Goes to : Client
               if(updcard.cardStatus==='Ready for Client Review' && req.query.trigger==='updateStatus'){
                    User.find({client: updcard.client}, function (err, users) {
                         if(err){
                              console.log(err);
                         } else {
                              users.forEach(function (user) {
                                   var locals = {};
                                   locals.userName = user.firstName + ' '+ user.lastName;
                                   locals.cardName = updcard.name;
                                   locals.email = user.email;
                                   mailService.sendmail('ready-for-review', null, 'New Card Ready for Review', locals);
                              });
                         }
                    });
               }
               //When : When status for any card goes to “edit required”
               //Goes to : Admin & Developer
               if(updcard.cardStatus==='Edits Required' && req.query.trigger==='updateStatus'){
                    User.find({}, function (err, users) {
                         if(err){
                              console.log(err);
                         } else {
                              users.forEach(function (user) {
                                   if(user.role === 'admin' || (user.role ==='developer' && checkClaimForUser(user, updcard))){
                                        var locals = {};
                                        locals.userName = user.firstName + ' '+ user.lastName;
                                        locals.cardName = updcard.name;
                                        locals.email = user.email;
                                        mailService.sendmail('need-further-editing', null, 'Card needs further editing', locals);
                                   }
                              });
                         }
                    });
               }
               //When : Every time a client leaves a comment on a card
               //Goes to : Admins & Assigned Developer for that card
               if(req.query.trigger==='commentAdd'){
                    if (req.user.role ==='client'){
                         User.find({}, function (err, users) {
                              if(err){
                                   console.log(err);
                              } else {
                                   users.forEach(function (user) {
                                        if(user.role === 'admin' || (user.role ==='developer' && checkClaimForUser(user, updcard))) {
                                             var locals = {};
                                             locals.userName = user.firstName + ' ' + user.lastName;
                                             locals.cardName = updcard.name;
                                             locals.email = user.email;
                                             locals.clientName = req.user.firstName + ' ' + req.user.lastName;
                                             locals.comment = updcard.comments[updcard.comments.length - 1].comment;
                                             mailService.sendmail('internal-comment', null, 'New Comment from Client', locals);
                                        }
                                   });
                              }
                         });
                    }
                    //When : Every time a developer leave a comment on a card
                    //Goes to : Client
                    if(req.user.role ==='developer'){
                         User.find({client: updcard.client}, function (err, users) {
                              if(err){
                                   console.log(err);
                              } else {
                                   users.forEach(function (user) {
                                        var locals = {};
                                        locals.userName = user.firstName + ' '+ user.lastName;
                                        locals.cardName = updcard.name;
                                        locals.email = user.email;
                                        locals.developerName = req.user.firstName + ' ' + req.user.lastName;
                                        locals.comment = updcard.comments[updcard.comments.length - 1].comment;
                                        mailService.sendmail('client-comment', null, 'New Comment from Developer', locals);
                                   });
                              }
                         });
                    }
               }
			res.jsonp(card);
		}
	});
};

/**
 * Delete an Card
 */
exports.delete = function(req, res) {
	var card = req.card ;

	card.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(card);
		}
	});
};

/**
 * List of Cards
 */
exports.list = function(req, res) { 
	Card.find().sort('-updatedAt').populate('user', 'firstName lastName displayName').exec(function(err, cards) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.status(200).jsonp(cards);
		}
	});
};

/**
 * Card middleware
 */
exports.cardByID = function(req, res, next, id) { 
	Card.findById(id).populate('user', 'displayName').exec(function(err, card) {
		if (err) return next(err);
		if (! card) return next(new Error('Failed to load Card ' + id));
		req.card = card ;
		next();
	});
};

/**
 * Card authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
     var claimedCardsIds = getIds(req.user.claimedCards);
     if(!req.card.user)req.card.user = {id: 'account_deleted'};
	if (req.card.user.id == req.user.id || _.contains(claimedCardsIds, String(req.card._id))) {
          next();
	} else {
          return res.status(403).send('User is not authorized');
     }

};

/**
 * Claim card
 */
exports.claim = function(req, res) {
     var userId= req.body.user._id;
     function setExpirationDate(days) {
          var date = new Date();
          var expiration = date;
          expiration.setDate(date.getDate() + days);
          return expiration;
     }
     User.findById(userId, '-salt -password -__v', function (err, user) {
          if(!user.claimedCards){
               user.claimedCards=[];
               user.claimedCards.push({claimedId: req.body.card._id, claimedAt: new Date(), expireAt:setExpirationDate(1)});
          } else {
               user.claimedCards.push({claimedId: req.body.card._id, claimedAt: new Date(), expireAt:setExpirationDate(1)});
          }
          user.save(function (err, usr) {
               if (err) return res.status(500).json('error', err);
                    Card.findById(req.body.card._id, function (err, card) {
                         card.claimedBy = usr;
                         card.save(function (err, crd) {
                              if (err) return res.status(500).json('error', err);
                              res.status(200).json({card:crd, user:usr});
                         })
                    })
               })
          });
};

/**
 * remove card from claimed ones
 * params: req.body.card
 *         req.body.user
 */
exports.removeClaim = function(req, res) {
     User.findById(req.body.user._id, '-salt -password -__v', function (err, user) {
          if (err) return res.status(500).json('error', err);
          for (var i = 0; i < user.claimedCards.length; i += 1) {
               if (user.claimedCards[i].claimedId==req.body.card._id){
                    user.claimedCards.splice(i, 1);
                    break;
               }
          }
          user.save(function (err, usr) {
               if (err) return res.status(500).json('error', err);
                    Card.findById(req.body.card._id, function (err, card) {
                         if (err) return res.status(500).json('error', err);
                         card.claimedBy = '';
                         card.save(function (err, crd) {
                              if (err) return res.status(500).json('error', err);
                              res.status(200).json({card:crd, user:usr});
                         })
                    })
               })
          });
};

function getIds(array) {
     var result = [];
     for (var i = 0; i < array.length; i += 1) {
          result.push(array[i].claimedId)
     }
     return result;
}

function checkClaimForUser(user, card) {
     for (var i = 0; i < card.claimedBy.length; i += 1) {
          if(card.claimedBy[i]._id == user._id){
               return true;
          }
     }
     return false;
}
