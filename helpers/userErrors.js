const emailRegExp = /\S+@\S+\.\S+/;

const sessions = (user, password) => {
  const errors = [];
  if (!user)
    errors.push({
      field: 'email',
      message: "User with this email doesn't exist",
    });
  else if (user) {
    if (user.password !== password)
      errors.push({ field: 'password', message: 'Wrong password' });
  }
  return errors;
};

const reqErrors = (phone, email, password) => {
  const errors = [];
  if (phone && phone.length !== 13)
    errors.push({
      field: 'phone',
      message: 'Incorrect phone',
    });
  if (!emailRegExp.test(email))
    errors.push({
      field: 'email',
      message: 'Incorrect email',
    });
  if (password.length < 4 || password.length > 40)
    errors.push({
      field: 'password',
      message:
        'Password should contain at least 4 characters, but less then 41',
    });
  return errors;
};

const updUser = (phone, email, curr_pass, new_pass, user, updates) => {
  const errors = [];
  const newUpdates = updates;
  if (phone && phone.length !== 13)
    errors.push({
      field: 'phone',
      message: 'Incorrect phone',
    });
  if (email && !emailRegExp.test(email))
    errors.push({
      field: 'email',
      message: 'Incorrect email',
    });
  if (curr_pass) {
    if (!new_pass)
      errors.push({
        field: 'new_password',
        message: 'Should contain new password',
      });
    else if (new_pass.length < 4 || new_pass.length > 40)
      errors.push({
        field: 'new_password',
        message:
          'New password should contain at least 4 characters, but less then 41',
      });
    else {
      newUpdates['password'] = new_pass;
      delete newUpdates['new_password'];
      delete newUpdates['current_password'];
    }
    if (user.password !== curr_pass)
      errors.push({
        field: 'current_password',
        message: 'Wrong current password',
      });
  }
  return { errors, newUpdates };
};

module.exports = {
  sessions,
  reqErrors,
  updUser,
};
