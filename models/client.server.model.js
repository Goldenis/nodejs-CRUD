'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Client Schema
 */
var ClientSchema = new Schema({
	companyName: {
		type: String,
		default: '',
		required: 'Please fill Company name',
		trim: true
	},
	fwUrl: {
		type: String,
		default: '',
		trim: true
	},
	production_refresh_url: {
		type: String,
		default: '',
		trim: true
	},
	beta_refresh_url: {
		type: String,
		default: '',
		trim: true
	},
	header: {
		type: String,
		default: ''
	},
	footer: {
		type: String,
		default: ''
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	variables: [{ 
			   kind: {type: String},
			   variable: {type: String},
               value: {type: String}
             }]
});

mongoose.model('Client', ClientSchema);