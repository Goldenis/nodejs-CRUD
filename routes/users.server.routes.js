'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');

module.exports = function(app) {
	// User Routes
	var users = require('../../app/controllers/users.server.controller');

     app.param('userId', function(req, res, next, userId) {
          req.userId = userId;
          next();
     });


     // Setting up the admin profile api
     app.route('/users/all').get(users.getAllUsers); // users.hasAdminRole, -removing restrictions
     app.route('/users/:userId').get(users.getUserById);// users.hasAdminRole, -removing restrictions
     app.route('/users/:userId/myCards').get(users.getUserCards);
     app.route('/users/:userId/changePermissions').put(users.updatePermissions);// users.hasAdminRole, -removing restrictions
     app.route('/users/:userId/changePassword').put(users.changeUserPassword);// users.hasAdminRole, -removing restrictions
     app.route('/users/:userId/userData').put(users.updateUserData);// users.hasAdminRole, -removing restrictions
     app.route('/users/:userId').delete(users.deleteUser);// users.hasAdminRole, -removing restrictions

     // Setting up the users profile api
	app.route('/users/me').get(users.me);
	app.route('/users').put(users.update);
	app.route('/users/accounts').delete(users.removeOAuthProvider);

	// Setting up the users password api
	app.route('/users/password').post(users.changePassword);
	app.route('/auth/forgot').post(users.forgot);
	app.route('/auth/reset/:token').get(users.validateResetToken);
	app.route('/auth/reset/:token').post(users.reset);

	// Setting up the users authentication api
	app.route('/auth/signup').post(users.signup);// users.hasAdminRole, -removing restrictions
	app.route('/auth/signin').post(users.signin);
	app.route('/auth/signout').get(users.signout);

	// Setting the facebook oauth routes
	app.route('/auth/facebook').get(passport.authenticate('facebook', {
		scope: ['email']
	}));
	app.route('/auth/facebook/callback').get(users.oauthCallback('facebook'));

	// Setting the twitter oauth routes
	app.route('/auth/twitter').get(passport.authenticate('twitter'));
	app.route('/auth/twitter/callback').get(users.oauthCallback('twitter'));

	// Setting the google oauth routes
	app.route('/auth/google').get(passport.authenticate('google', {
		scope: [
			'https://www.googleapis.com/auth/userinfo.profile',
			'https://www.googleapis.com/auth/userinfo.email'
		]
	}));
	app.route('/auth/google/callback').get(users.oauthCallback('google'));

	// Setting the linkedin oauth routes
	app.route('/auth/linkedin').get(passport.authenticate('linkedin'));
	app.route('/auth/linkedin/callback').get(users.oauthCallback('linkedin'));

	// Setting the github oauth routes
	app.route('/auth/github').get(passport.authenticate('github'));
	app.route('/auth/github/callback').get(users.oauthCallback('github'));

	// Finish by binding the user middleware
	app.param('userId', users.userByID);
};
