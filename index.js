'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

// get Bot, const, and Facebook API
const bot = require('./bot.js');
const Config = require('./const.js');
const FB = require('./facebook.js');

const app = express()
app.set('port', (process.env.PORT || 5000))

// Process application/json
app.use(bodyParser.json())

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Setting up our bot
const wit = bot.getWit();

// Wit.ai bot specific code

// This will contain all user sessions.
// Each session has an entry:
// sessionId -> {fbid: facebookUserId, context: sessionState}
const sessions = {};

const findOrCreateSession = (fbid) => {
  let sessionId;
  // Let's see if we already have a session for the user fbid
  Object.keys(sessions).forEach(k => {
    if (sessions[k].fbid === fbid) {
      // Yep, got it!
      sessionId = k;
    }
  });
  if (!sessionId) {
    
    // No session found for user fbid, let's create a new one
    sessionId = new Date().toISOString();
    sessions[sessionId] = {
      fbid: fbid,
      context: {
        _fbid_: fbid
      }
    }; // set context, _fid_
  }
  return sessionId;
};

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot!!')
})

// for Facebook Webhook verification
app.get('/webhook/', function (req, res) {
    if (!Config.FB_VERIFY_TOKEN) {
        throw new Error('missing FB_VERIFY_TOKEN');
    }
    if (req.query['hub.verify_token'] === Config.FB_VERIFY_TOKEN) {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})


// The main message handler
app.post('/webhook', (req, res) => {
  // Parsing the Messenger API response
  const messaging = FB.getFirstMessagingEntry(req.body);
  if (messaging && messaging.message) {

    // Yay! We got a new message!

    // We retrieve the Facebook user ID of the sender
    const sender = messaging.sender.id;

    if (sender == Config.FB_PAGE_ID){
      // Let's give the wheel back to our bot
      res.sendStatus(200);
      return;
    }

    // We retrieve the user's current session, or create one if it doesn't exist
    // This is needed for our bot to figure out the conversation history
    const sessionId = findOrCreateSession(sender);

    // We retrieve the message content
    const msg = messaging.message.text;
    const atts = messaging.message.attachments;

    if (atts) {
      // We received an attachment
      // Let's reply with an automatic message
      FB.fbMessage(
        sender,
        'Sorry I can only process text messages for now.'
      );
    } else if (msg) {
      // We received a text message
      // Let's forward the message to the Wit.ai Bot Engine
      // This will run all actions until our bot has nothing left to do
      wit.runActions(
        sessionId, // the user's current session
        msg, // the user's message 
        sessions[sessionId].context, // the user's current session state
        (error, context) => {
          if (error) {
            console.log('Oops! Got an error from Wit:', error);
          } else {
            // Our bot did everything it has to do.
            // Now it's waiting for further messages to proceed.
            console.log('Waiting for futher messages.');

            // Updating the user's current session state
            sessions[sessionId].context = context;

            // Based on the session state, you might want to reset the session.
            // This depends heavily on the business logic of your bot.
            // Example:
            if (context['done']) {
               sendReceiptMessage(sender, context.insuranceValue); 
               delete sessions[sessionId];
            }

          }
        }
      );
    }
  }
  res.sendStatus(200);
});


/*
// The main message handler
app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
        let event = req.body.entry[0].messaging[i]
        let sender = event.sender.id
        if (event.message && event.message.text) {
            let text = event.message.text
	    if (text === 'Generic') {
                sendGenericMessage(sender)
                continue
            }
            sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
        }
	if (event.postback) {
        	let text = JSON.stringify(event.postback)
        	sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token)
        	continue
      	}
    }
    res.sendStatus(200)
})
*/

const token = Config.FB_PAGE_ACCESS_TOKEN

function sendTextMessage(sender, text) {
    let messageData = { text:text }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function sendWelcomeMessage(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "First card",
                    "subtitle": "Element #1 of an hscroll",
                    "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.messenger.com",
                        "title": "web url"
                    }, {
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for first element in a generic bubble",
                    }],
                }, {
                    "title": "Second card",
                    "subtitle": "Element #2 of an hscroll",
                    "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
                    "buttons": [{
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for second element in a generic bubble",
                    }],
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function sendGenericMessage(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "First card",
                    "subtitle": "Element #1 of an hscroll",
                    "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.messenger.com",
                        "title": "web url"
                    }, {
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for first element in a generic bubble",
                    }],
                }, {
                    "title": "Second card",
                    "subtitle": "Element #2 of an hscroll",
                    "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
                    "buttons": [{
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for second element in a generic bubble",
                    }],
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}


function sendReceiptMessage(sender, total) {
    let messageData = {
        "attachment":{
            "type":"template",
            "payload":{
                "template_type":"receipt",
                "recipient_name":"Stephane Crozatier",
                "order_number":"12345678902",
                "currency":"USD",
                "payment_method":"Visa 2345",        
                "order_url":"http://petersapparel.parseapp.com/order?order_id=123456",
                "timestamp":"1428444852", 
                "elements":[
                {
                    "title":"Seguro Auto",
                    "subtitle":"Santa Fe",
                    "quantity":1,
                    "price":total,
                    "currency":"USD",
                    "image_url":"http://edmarscarshop.weebly.com/uploads/4/7/2/1/47210243/s839229361958944689_p5_i3_w1100.jpeg"
                },
                ],
                "summary":{
                "subtotal":75.00,
                "shipping_cost":4.95,
                "total_tax":6.19,
                "total_cost":total
                },
                "adjustments":[
                {
                    "name":"New Customer Discount",
                    "amount":20
                },
                {
                    "name":"$10 Off Coupon",
                    "amount":10
                }
                ]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}




 function getProfile (id, cb) {
    
    if (!cb) cb = Function.prototype
     request({
      uri: 'https://graph.facebook.com/v2.6/'+id,
      qs: {
        fields: 'first_name,last_name,locale,timezone,gender',
        access_token: token
      },
      json: true
    }, (err, res, body) => {
      console.log(body)
      if (err) return cb(err)
      if (body.error) return cb(body.error)
      cb(null, body)

    })
  }
/*  

  getProfile(fbid, (err, profile) => {
        console.log("FBID:" + fbid);
        console.log("Error:" + err);
        console.log("Profile:" + profile);
        
        if (err) return;
        var text = `Oi ${profile.first_name} ${profile.last_name}. Eu vou te ajudar com a sua próxima viagem.\n Qual sua cidade de origem?`
        sendTextMessage(fbid, text)
        console.log(text)
    })

*/

// Spin up the server
var server = app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})

exports.closeServer = function(){
  server.close();
};