'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Card Schema
 */
var CardSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Card name',
		trim: true
	},
	client: {
		type: String
	},
     claimedBy: [Schema.Types.Mixed],
	notes: {
		type: String,
		default: ''
	},
	actions: [{
		short: {type: String},
		val: {type:String}
	}],
	original_html: {
		type: String,
		default: ''
	},
	html: {
		type: String,
		default: ''
	},
	css: {
		type: String,
		default: ''
	},
	less: {
		type: String,
		default: ''
	},
	variables: {
          type:Schema.Types.Mixed
     },
	js: {
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
	activeImage: {
		type: Number,
		default: 0
	},
	timelog: [{
		start: {type:Date},
		end: {type:Date},
		user: {
			type:Schema.Types.Mixed
		}

	}],
	images: [{ 
			   url: {type: String},
			   note: {type: String},
               thumbUrl: {type: String}
            }],
    comments: [{     		
			    user: {type: String},
			   displayName: {type: String},
			   comment: {type: String},
			   created: {
					type: Date,
					default: Date.now
				}
             }],
     cardStatus: {
          type: String,
          enum: ['To Do', 'In Progress', 'Ready for Team Review', 'Ready for Client Review', 'Edits Required', 'Approved'],
          default: 'To Do'
     },
     updatedAt: {
          type: Date,
          default: Date.now
     }

});

mongoose.model('Card', CardSchema);
