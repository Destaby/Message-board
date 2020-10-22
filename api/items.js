const express = require('express');
const multer = require('multer');
const router = express.Router();
const db = require('../database');
const err = require('../helpers/itemErrors');

const upload = multer({});

const getFullItemsInfo = items => new Promise(resolve => {
  const response = [];
  items.forEach(async (item, key) => {
    const { id, created_at, title, price, image, user_id } = item;
    const [user] = await db.select('users', ['phone', 'name', 'email'], {
      id: user_id,
    });
    response.push({
      id,
      created_at,
      title,
      price: Math.round(price * 100) / 100,
      image,
      user_id,
      user,
    });
    if (key === items.length - 1) resolve(response);
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const [item] = await db.select('items', ['*'], { id });
  if (!item) {
    res.status(404);
    return res.end();
  }
  const [user] = await db.select('users', ['id', 'phone', 'name', 'email'], {
    id: item.user_id,
  });
  res.json({
    ...item,
    price: Math.round(item.price * 100) / 100,
    user: { ...user },
  });
});

router.put('/:id', async (req, res) => {
  const token = req.headers.authorization;
  const [user] = await db.select('users', ['id', 'phone', 'name', 'email'], {
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
  const { title, price } = req.body;
  if (!title && !price) return res.end();
  if (title && title.length < 3) {
    res.status(422);
    return res.json([
      {
        field: 'title',
        message: 'Title should contain at least 3 characters',
      },
    ]);
  }
  db.update(
    'items',
    { title: title || item.title, price: price || item.price },
    { id }
  );
  return res.json({
    ...item,
    title: title || item.title,
    price: Math.round((price || item.price) * 100) / 100,
    user: { ...user },
  });
});

router.get('/', async (req, res) => {
  const fields = req.query;
  if (!Object.keys(fields).length) fields.title = '*';
  const { title, user_id, order_by, order_type } = fields;
  const searchFields = { title: title || '*', user_id: user_id || '*' };
  const items = await db.select(
    'items',
    ['*'],
    searchFields,
    order_by || 'created_at',
    order_type || 'desc'
  );
  if (items.length) {
    getFullItemsInfo(items).then(result => res.json(result));
  }
});

router.post('/', async (req, res) => {
  const token = req.headers.authorization;
  const [user] = await db.select('users', ['id', 'phone', 'name', 'email'], {
    token,
  });
  if (!user) {
    res.status(401);
    return res.end();
  }
  const { title, price } = req.body;
  const errors = err.itemVal(title, price);
  if (errors.length) {
    res.status(422);
    return res.json(errors);
  }
  const time = Math.floor(new Date().getTime() / 1000);
  await db.insert('items', {
    title,
    price,
    created_at: time,
    user_id: user.id,
  });
  const [{ id, image }] = await db.select('items', ['id', 'image'], {
    title,
    created_at: time,
  });
  res.json({
    id,
    created_at: time,
    image,
    title,
    price,
    user_id: user.id,
    user,
  });
});

router.post('/:id/image', upload.single('image'), async (req, res) => {
  const token = req.headers.authorization;
  const [user] = await db.select('users', ['id', 'phone', 'name', 'email'], {
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
  const { originalname, size } = req.file;
  const errors = err.imageVal(originalname, size);
  if (errors.length) {
    res.status(422);
    return res.json(errors);
  }
  return res.json({
    ...item,
    price: Math.round(item.price * 100) / 100,
    user: { ...user },
  });
});

router.delete('/:id/image', async (req, res) => {
  const token = req.headers.authorization;
  const [user] = await db.select('users', ['id', 'phone', 'name', 'email'], {
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
