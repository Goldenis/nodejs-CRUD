'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Page Schema
 */
var PageSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Page name',
		trim: true
	},
	//content: {
	//	type: String
	//},
	created: {
		type: Date
	},
     updateHistory: {
          type: Schema.Types.Mixed
	},
	user: {
		type: Schema.Types.Mixed
	},
     client: {
          type: Schema.Types.Mixed
     },
     cardsOrder:{
          type: [String]
     },
     cards: {
          type: Schema.Types.Mixed
     },
     sourceCode: {
     	type: String,
     	default: ''
     },
     status: {
          type: String,
          enum: ['Draft', 'Preview', 'Live', 'Closed'],
          default: 'Draft'
     }
});

mongoose.model('Page', PageSchema);
