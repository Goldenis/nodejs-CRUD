'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Page = mongoose.model('Page'),
	_ = require('lodash');

/**
 * Create a Page
 */
exports.create = function(req, res) {
     console.log(req.body);

	var page = new Page(req.body);
	//page.user = req.user;
	//page.client = req.client;

     //page.client = req.body.client._id;
   //  console.log('page client',page.client);
	page.save(function(err) {
          console.log(err);
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(page);
		}
	});
};

/**
 * Show the current Page
 */
exports.read = function(req, res) {
     //console.log('sjhkajsh');
     //console.log(req.pageId);
     console.log('req.page.cards[0].actions', req.page.cards && (req.page.cards[0] || {}).actions);
	res.jsonp(req.page);
	//res.jsonp({lol:'lol'});
};

/**
 * Update a Page
 */
exports.update = function(req, res) {
	var page = req.page ;
	page = _.extend(page , req.body);

	page.save(function(err) {
		if (err) {
               console.log('err', err);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(page);
		}
	});
};

/**
 * Delete an Page
 */
exports.delete = function(req, res) {
	var page = req.page ;

	page.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(page);
		}
	});
};

/**
 * List of Pages
 */
exports.list = function(req, res) { 
	Page.find().sort('-created')/*.populate('user', 'displayName')*/.exec(function(err, pages) {
		if (err) {
               console.log(err);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(pages);
		}
	});
};

/**
 * Page middleware
 */
exports.pageByID = function(req, res, next, id) {
	Page.findById(id,'-__v')/*.populate('user', 'displayName')*/.exec(function(err, page) {
		if (err) return next(err);
		if (! page) return next(new Error('Failed to load Page ' + id));
		req.page = page ;
		next();
	});
};

/**
 * Page authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.page.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};


/**
 * List of cards matched with clientName
 */

exports.listByClientName = function( req, res ) {
     Page.find({'client.companyName': req.params.clientName}).sort('-created').exec(function(err, pages) {
          if (err) {
               return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
               });
          } else {

               var new_generated = [];
               var month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
               for ( var i = 0; i < pages.length; i++) {
                    var date = new Date(pages[i].created);
                    /*
                    var imageURL = '';
                    try {
                         imageURL = pages[i].images[pages[i].activeImage].url;
                    } catch (err) {
                         imageURL = '';
                    }
                    */
                    var obj = {
                         "title" : pages[i].name,
                         "status" : pages[i].status,
                         "date" : month[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear(),
                         "url_title" : pages[i].name.replace(/ /g, "-"),
                         "Html Markup" : pages[i].sourceCode,
                         "Image" : "{parents:pages_image}"
                    };

                    new_generated.push(obj);
               }

               res.status(200).jsonp(new_generated);
          }
     });
};

exports.listByClientNameStatus = function( req, res ) {
     Page.find({'client.companyName': req.params.clientName, 'status': req.params.statusName}).sort('-created').exec(function(err, pages) {
          if (err) {
               return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
               });
          } else {

               var new_generated = [];
               var month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
               for ( var i = 0; i < pages.length; i++) {
                    var date = new Date(pages[i].created);
                    /*
                    var imageURL = '';
                    try {
                         imageURL = pages[i].images[pages[i].activeImage].url;
                    } catch (err) {
                         imageURL = '';
                    }
                    */
                    var obj = {
                         "title" : pages[i].name,
                         "status" : pages[i].status,
                         "date" : month[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear(),
                         "url_title" : pages[i].name.replace(/ /g, "-"),
                         "Html Markup" : pages[i].sourceCode,
                         "Image" : "{parents:pages_image}"
                    };

                    new_generated.push(obj);
               }

               res.status(200).jsonp(new_generated);
          }
     });
}



