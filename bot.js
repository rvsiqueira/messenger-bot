'use strict';

// Weather Example
// See https://wit.ai/sungkim/weather/stories and https://wit.ai/docs/quickstart
const Wit = require('node-wit').Wit;
const FB = require('./facebook.js');
const Config = require('./const.js');

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};

// Bot actions
const actions = {
  say(sessionId, context, message, cb) {
        console.log("say:"+ message);
        cb();
  },
  merge(sessionId, context, entities, message, cb) {
    console.log(entities);
    console.log(context);
    console.log("merge: " + message);
    // Retrieve the location entity and store it into a context field
    if (firstEntityValue(entities, 'insurance')) {
      context.insurance = firstEntityValue(entities, 'insurance'); // store it in context
    }
    if (firstEntityValue(entities, 'name')) {
      context.name = firstEntityValue(entities, 'name');; // store it in context
    }
    if (firstEntityValue(entities, 'age')) {
      context.age = firstEntityValue(entities, 'age'); // store it in context
    }
    if (firstEntityValue(entities, 'carModel')) {
      context.carModel = firstEntityValue(entities, 'carModel'); // store it in context
    }
    cb(context);
  },

  error(sessionId, context, error) {
    console.log(error.message);
  },

  // fetch-weather bot executes
  ['fetch-insurance'](sessionId, context, cb) {
    // Here should go the api call, e.g.:
    // context.forecast = apiCall(context.loc)
    context.insuranceValue = 'R$100';
    cb(context);
  },
};


const getWit = () => {
  return new Wit(Config.WIT_TOKEN, actions);
};

exports.getWit = getWit;

// bot testing mode
// http://stackoverflow.com/questions/6398196
if (require.main === module) {
  console.log("Bot testing mode.");
  const client = getWit();
  client.interactive();
}