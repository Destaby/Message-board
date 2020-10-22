const express = require('express');
const router = express.Router();
const db = require('../database');
const err = require('../helpers/userErrors');

const generateToken = require('../helpers/genToken');

router.post('/', (req, res) => {
  const { phone, name, email, password } = req.body;
  const errors = err.reqErrors(phone, email, password);
  if (errors.length) {
    res.status(422);
    return res.json(errors);
  }
  const token = generateToken();
  db.insert('users', { phone: phone || '', name, email, password, token });
  res.json({ token });
});

router.get('/me', async (req, res) => {
  const token = req.headers.authorization;
  const [user] = await db.select('users', ['id', 'phone', 'name', 'email'], {
    token,
  });
  if (!user) {
    res.status(401);
    return res.end();
  }
  res.json(user);
});

router.put('/me', async (req, res) => {
  const { phone, name, email, current_password, new_password } = req.body;
  const updates = req.body;
  const token = req.headers.authorization;
  const [user] = await db.select('users', ['id', 'password'], {
    token,
  });
  if (!user) {
    res.status(401);
    return res.end();
  }
  const { errors, newUpdates } = err.updUser(
    phone,
    email,
    current_password,
    new_password,
    user,
    updates
  );
  if (errors && errors.length) {
    res.status(422);
    return res.json(errors);
  }
  db.update('users', newUpdates, { token });
  res.json({ id: user.id, phone, name, email });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const [user] = await db.select('users', ['phone', 'name', 'email'], {
    id,
  });
  if (!user) {
    res.status(404);
    return res.end();
  }
  const { phone, name, email } = user;
  res.json({ id, phone, name, email });
});

router.get('/', async (req, res) => {
  const { query: fields } = req;
  if (!Object.keys(fields).length) return res.end();
  const users = await db.select(
    'users',
    ['id', 'phone', 'name', 'email'],
    fields
  );
  if (users.length) return res.json(users);
  res.end();
});

module.exports = router;
