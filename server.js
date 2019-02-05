"use strict";

const http = require("http");
const finalhandler = require("finalhandler");
const Router = require("router");
const bodyParser = require("body-parser");
const url = require("url");
const bcrypt = require("bcrypt");

const Message = require("./message");

const router = new Router({ mergeParams: true });
router.use(bodyParser.json());

router.get("/", (request, response) => {
  response.setHeader("Content-Type", "text/plain; charset=utf-8");
  response.end("Hello, World!");
});

// not RESTful...
router.post("/message", (request, response) => {
  const { body } = request;

  if (typeof body === "object") {
    const message = new Message(body.message);
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.statusCode = 200; // should be 201?
    response.end(JSON.stringify(message.id));
  } else {
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.statusCode = 400;
    response.end(JSON.stringify({ message: "Bad request" }));
  }
});

router.get("/messages", (request, response) => {
  const query = url.parse(request.url, true).query;
  const { encrypt } = query;

  const responseBody = JSON.stringify(Message.serializeAll());
  if (encrypt === "true") {
    bcrypt.hash(responseBody, 10).then(hash => {
      response.statusCode = 200;
      response.setHeader("Content-Type", "text/plain; charset=utf-8");
      response.end(hash);
    });
  } else {
    response.statusCode = 200;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(responseBody);
  }
});

// not RESTful...
router.get("/message/:id", (request, response) => {
  const { id } = request.params;
  const query = url.parse(request.url, true).query;
  const { encrypt } = query;

  // bad params
  if (!id || !parseInt(id)) {
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.statusCode = 400;
    response.end(JSON.stringify({ message: "No id provided" }));
    return;
  }

  const message = Message.find(parseInt(id));

  //not found
  if (!message) {
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.statusCode = 404;
    response.end(JSON.stringify({ message: "Not found" }));
    return;
  }

  // ok
  const responseBody = JSON.stringify(message.serialize());

  if (encrypt === "true") {
    bcrypt.hash(responseBody, 10).then(hash => {
      response.setHeader("Content-Type", "text/plain; charset=utf-8");
      response.statusCode = 200;
      response.end(hash);
    });
  } else {
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.statusCode = 200;
    response.end(responseBody);
  }
});

const server = http.createServer((request, response) => {
  router(request, response, finalhandler(request, response));
});

exports.listen = function(port, callback) {
  server.listen(port, callback);
};

exports.close = function(callback) {
  server.close(callback);
};
