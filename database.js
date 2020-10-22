const mysql = require('mysql');
const config = require('./config/database');

const OPERATORS = ['>=', '<=', '<>', '>', '<'];

const where = conditions => {
  const clause = [];
  const args = [];
  const keys = Object.keys(conditions);
  for (const key of keys) {
    let operator = '=';
    let value = conditions[key];
    if (typeof value === 'string') {
      for (const op of OPERATORS) {
        const len = op.length;
        if (value.startsWith(op)) {
          operator = op;
          value = value.substring(len);
        }
      }
      if (value.includes('*') || value.includes('?')) {
        operator = 'LIKE';
        value = value.replace(/\*/g, '%').replace(/\?/g, '_');
      }
    }
    clause.push(`${key} ${operator} ?`);
    args.push(value);
  }
  return { clause: clause.join(' AND '), args };
};

const updates = delta => {
  const clause = [];
  const args = [];
  const keys = Object.keys(delta);
  for (const key of keys) {
    const value = delta[key].toString();
    clause.push(`${key} = ?`);
    args.push(value);
  }
  return { clause: clause.join(', '), args };
};

class Database {
  constructor(config) {
    this.pool = mysql.createConnection(config);
    this.start();
  }

  start() {
    this.pool.connect(err => {
      if (err) throw err;
      console.log('DB connected...');
    });
  }

  query(sql, values, byCallback = false) {
    if (byCallback)
      return new Promise((resolve, reject) => {
        this.pool.query(sql, values, (err, data) => {
          if (err) reject(err);
          resolve(data);
        });
      });
    return this.pool.query(sql, values);
  }

  insert(table, record) {
    const keys = Object.keys(record);
    const nums = new Array(keys.length);
    const data = new Array(keys.length);
    let i = 0;
    for (const key of keys) {
      data[i] = record[key];
      nums[i++] = `?`;
    }
    const fields = keys.join(', ');
    const params = nums.join(', ');
    const sql = `INSERT INTO ${table} (${fields}) VALUES (${params})`;
    return this.query(sql, data);
  }

  async select(table, fields = ['*'], conditions = null, order_by, order) {
    const keys = fields.join(', ');
    let sql = `SELECT ${keys} FROM ${table}`;
    let whereClause = '';
    let args = [];
    if (conditions) {
      const whereData = where(conditions);
      whereClause = ' WHERE ' + whereData.clause;
      args = whereData.args;
      sql += whereClause;
    }
    if (order_by) {
      sql += ' ORDER BY ' + order_by;
    }
    if (order === 'desc') {
      sql += ` DESC`;
    } else if (order === 'asc') {
      sql += ` ASC`;
    }
    const res = await this.query(sql, args, true);
    return res;
  }

  delete(table, conditions = null) {
    const { clause, args } = where(conditions);
    const sql = `DELETE FROM ${table} WHERE ${clause}`;
    return this.query(sql, args);
  }

  update(table, delta = null, conditions = null) {
    const upd = updates(delta);
    const cond = where(conditions, upd.args.length + 1);
    const sql = `UPDATE ${table} SET ${upd.clause} WHERE ${cond.clause}`;
    const args = [...upd.args, ...cond.args];
    return this.query(sql, args);
  }
}

module.exports = new Database(config);
