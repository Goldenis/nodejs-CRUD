'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Page = mongoose.model('Page'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, page;

/**
 * Page routes tests
 */
describe('Page CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Page
		user.save(function() {
			page = {
				name: 'Page Name'
			};

			done();
		});
	});

	it('should be able to save Page instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Page
				agent.post('/pages')
					.send(page)
					.expect(200)
					.end(function(pageSaveErr, pageSaveRes) {
						// Handle Page save error
						if (pageSaveErr) done(pageSaveErr);

						// Get a list of Pages
						agent.get('/pages')
							.end(function(pagesGetErr, pagesGetRes) {
								// Handle Page save error
								if (pagesGetErr) done(pagesGetErr);

								// Get Pages list
								var pages = pagesGetRes.body;

								// Set assertions
								(pages[0].user._id).should.equal(userId);
								(pages[0].name).should.match('Page Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Page instance if not logged in', function(done) {
		agent.post('/pages')
			.send(page)
			.expect(401)
			.end(function(pageSaveErr, pageSaveRes) {
				// Call the assertion callback
				done(pageSaveErr);
			});
	});

	it('should not be able to save Page instance if no name is provided', function(done) {
		// Invalidate name field
		page.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Page
				agent.post('/pages')
					.send(page)
					.expect(400)
					.end(function(pageSaveErr, pageSaveRes) {
						// Set message assertion
						(pageSaveRes.body.message).should.match('Please fill Page name');
						
						// Handle Page save error
						done(pageSaveErr);
					});
			});
	});

	it('should be able to update Page instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Page
				agent.post('/pages')
					.send(page)
					.expect(200)
					.end(function(pageSaveErr, pageSaveRes) {
						// Handle Page save error
						if (pageSaveErr) done(pageSaveErr);

						// Update Page name
						page.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Page
						agent.put('/pages/' + pageSaveRes.body._id)
							.send(page)
							.expect(200)
							.end(function(pageUpdateErr, pageUpdateRes) {
								// Handle Page update error
								if (pageUpdateErr) done(pageUpdateErr);

								// Set assertions
								(pageUpdateRes.body._id).should.equal(pageSaveRes.body._id);
								(pageUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Pages if not signed in', function(done) {
		// Create new Page model instance
		var pageObj = new Page(page);

		// Save the Page
		pageObj.save(function() {
			// Request Pages
			request(app).get('/pages')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Page if not signed in', function(done) {
		// Create new Page model instance
		var pageObj = new Page(page);

		// Save the Page
		pageObj.save(function() {
			request(app).get('/pages/' + pageObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', page.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Page instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Page
				agent.post('/pages')
					.send(page)
					.expect(200)
					.end(function(pageSaveErr, pageSaveRes) {
						// Handle Page save error
						if (pageSaveErr) done(pageSaveErr);

						// Delete existing Page
						agent.delete('/pages/' + pageSaveRes.body._id)
							.send(page)
							.expect(200)
							.end(function(pageDeleteErr, pageDeleteRes) {
								// Handle Page error error
								if (pageDeleteErr) done(pageDeleteErr);

								// Set assertions
								(pageDeleteRes.body._id).should.equal(pageSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Page instance if not signed in', function(done) {
		// Set Page user 
		page.user = user;

		// Create new Page model instance
		var pageObj = new Page(page);

		// Save the Page
		pageObj.save(function() {
			// Try deleting Page
			request(app).delete('/pages/' + pageObj._id)
			.expect(401)
			.end(function(pageDeleteErr, pageDeleteRes) {
				// Set message assertion
				(pageDeleteRes.body.message).should.match('User is not logged in');

				// Handle Page error error
				done(pageDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Page.remove().exec();
		done();
	});
});