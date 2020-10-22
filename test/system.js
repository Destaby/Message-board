'use strict';

const http = require('http');
const assert = require('assert').strict;

const HOST = 'localhost';
const PORT = process.env.PORT || 5000;
const ID = 7;

const tasks = [
  {
    post: '/api/users',
    status: 200,
    data: JSON.stringify({
      phone: '+380948375325',
      name: 'lexa',
      email: 'lexa@mail.com',
      password: '123456',
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  },
  {
    get: '/api/users/me',
    headers: {
      Authorization: '0jloe0AHXfZFllioJ37sA7HDVRd52c2h',
    },
    status: 200,
    expectedBody: JSON.stringify({
      id: ID,
      phone: '+380948375325',
      name: 'lexa',
      email: 'lexa@mail.com',
    }),
  },
];

const getRequest = task => {
  const request = {
    host: HOST,
    port: PORT,
    agent: false,
  };
  if (task.get) {
    request.method = 'GET';
    request.path = task.get;
  } else if (task.post) {
    request.method = 'POST';
    request.path = task.post;
  }
  if (task.headers) {
    request.headers = task.headers;
  }
  return request;
};

const postCheck = task =>
  new Promise(resolve => {
    let token = '';
    const request = getRequest(task);
    console.log(request);
    const req = http.request(request);
    req.on('response', res => {
      const expectedStatus = task.status || 200;
      assert.equal(res.statusCode, expectedStatus);
      res.on('data', chunk => {
        console.log(chunk.toString());
        token = JSON.parse(chunk.toString()).token;
      });
      res.on('end', () => resolve(token));
    });
    req.on('error', err => {
      console.log(err.stack);
      process.exit(1);
    });
    if (task.data) req.write(task.data);
    req.end();
  });

const getCheck = task =>
  new Promise(resolve => {
    const request = getRequest(task);
    console.log(request);
    const req = http.request(request);
    req.on('response', res => {
      const expectedStatus = task.status || 200;
      assert.equal(res.statusCode, expectedStatus);
      res.on('data', chunk => {
        console.log(chunk.toString());
        assert.equal(chunk.toString(), task.expectedBody);
      });
      res.on('end', () => resolve());
    });
    req.on('error', err => {
      console.log(err.stack);
      process.exit(1);
    });
    if (task.data) req.write(task.data);
    req.end();
  });

postCheck(tasks[0]).then(token => {
  tasks[1].headers.Authorization = token;
  getCheck(tasks[1]);
});
