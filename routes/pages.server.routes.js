'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var pages = require('../../app/controllers/pages.server.controller');

	// Pages Routes
	app.route('/pages')
		.get(pages.list)
		.post(users.requiresLogin,pages.create);

	app.route('/pages/:pageId')
		.get(pages.read)
		.put(users.requiresLogin, pages.update)//pages.hasAuthorization,
		.delete(users.requiresLogin, pages.delete);//pages.hasAuthorization,
	
	app.route('/pages/json/:clientName')
    	.get(pages.listByClientName);

    app.route('/pages/json/:clientName/:statusName')
    	.get(pages.listByClientNameStatus);

	// Finish by binding the Page middleware
	app.param('pageId', pages.pageByID);
};
