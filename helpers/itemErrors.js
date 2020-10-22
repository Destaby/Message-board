const path = require('path');

const ALLOWED_SIZE = 30000;

const itemVal = (title, price) => {
  const errors = [];
  if (!title) {
    errors.push({
      field: 'title',
      message: 'Title is required',
    });
  }
  if (title && title.length < 3)
    errors.push({
      field: 'title',
      message: 'Title should contain at least 3 characters',
    });
  if (!price)
    errors.push({
      field: 'price',
      message: 'Price is required',
    });
  return errors;
};

const imageVal = (originalname, size) => {
  const errors = [];
  const ext = path.extname(originalname);
  if (ext !== '.jpg' && ext !== '.jpeg')
    errors.push({
      field: 'image',
      message: 'File should be jpg or jpeg type',
    });
  if (size > ALLOWED_SIZE)
    errors.push({
      field: 'image',
      message: `The file ${originalname} is too big`,
    });
  return errors;
};

module.exports = {
  itemVal,
  imageVal,
};
