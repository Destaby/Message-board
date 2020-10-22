const express = require('express');
const users = require('./users');
const items = require('./items');
const router = express.Router();
const db = require('../database');
const generateToken = require('../helpers/genToken');
const err = require('../helpers/userErrors');

router.use('/users', users);
router.use('/items', items);

router.post('/sessions', async (req, res) => {
  const { email, password } = req.body;
  const [user] = await db.select('users', ['password'], { email });
  const errors = err.sessions(user, password);
  if (errors.length) {
    res.status(422);
    return res.json(errors);
  }
  const token = generateToken();
  db.update('users', { token }, { email });
  res.json({ token });
});

router.delete('/item/:id', async (req, res) => {
  const token = req.headers.authorization;
  const [user] = await db.select('users', ['id', 'password'], {
    token,
  });
  if (!user) {
    res.status(401);
    return res.end();
  }
  const { id } = req.params;
  const [item] = await db.select('items', ['*'], { id });
  if (!item) {
    res.status(404);
    return res.end();
  }
  if (item.user_id !== user.id) {
    res.status(403);
    return res.end();
  }
  db.delete('items', { id });
  res.end();
});

module.exports = router;
