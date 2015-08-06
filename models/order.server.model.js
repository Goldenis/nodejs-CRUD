'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
     Schema = mongoose.Schema;

/**
 * Card Schema
 */
var OrderSchema = new Schema({
     name: {
          type: String,
          default: '',
          required: 'Please fill Order name',
          trim: true
     },
     subtotal: {
          numberOfElements: {
               type: Number,
               default: 0
          },
          price: {
          type: Number,
               default: 0
          },
          sumPriceOfCards: {
               type: Number,
               default: 0
          }
     },
     client: Schema.Types.Mixed,
     cards: {
          type: [Schema.Types.Mixed]
     },
     orderDate: {
          type: Date
     },
     dueDate: {
          type: Date
     },
     status: {
          type: String,
          enum: ['New Project', 'Dev in Progress', 'Client to Approve', 'PM to Approve', 'Deployed'],
          default: 'New Project'
     }
});

mongoose.model('Order', OrderSchema);
