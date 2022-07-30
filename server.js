const express = require("express");

require("dotenv").config();

// APP CREDENTIALS
const app = express();
const port = process.env.PORT || 5000;

// MESSENGER API
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    recipient: {
      id: sender_psid,
    },
    message: response,
  };

  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: "https://graph.facebook.com/v2.6/me/messages",
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: "POST",
      json: request_body,
    },
    (err, res, body) => {
      if (!err) {
        console.log("message sent!");
      } else {
        console.error("Unable to send message:" + err);
      }
    }
  );
}

function handleMessage(sender_psid, received_message) {
  let response;

  // Check if the message contains text
  if (received_message.text) {
    // Create the payload for a basic text message
    const msg = received_message.text;
    let reply;

    reply = `You sent the message: "${msg}". This API is under development. Stay in touch to get updates. - Astik Roy \nConnect with the developer: www.facebook.com/royastik27`;

    response = {
      text: reply,
    };
  }

  // Sends the response message
  callSendAPI(sender_psid, response);
}

app.use("/webhook", express.json());

// Creates the endpoint for our webhook
app.post("/webhook", (req, res) => {
  let body = req.body;

  if (!body) return res.sendStatus(404); // case for local testing

  // Checks this is an event from a page subscription
  if (body.object === "page") {
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {
      // 1. Gets the body of the webhook event
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      // 2. Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log("Sender PSID: " + sender_psid);

      // 3. Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send("EVENT_RECEIVED");
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

// Adds support for GET requests to our webhook
app.get("/webhook", (req, res) => {

  // Parse the query params
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === "subscribe" && token === PAGE_ACCESS_TOKEN) {
      // Responds with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  } else res.sendStatus(404); // my code
});

app.get('/', (req, res) => {
    res.send("Volaa!! It's working! ;)");
});

// SERVER LISTEN
app.listen(port, () => {
    console.log("Server is listening 😊");
});