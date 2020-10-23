CREATE DATABASE msgBoard;

USE msgBoard;

CREATE TABLE users(
  id        INT   AUTO_INCREMENT,
  email     VARCHAR(320)  NOT NULL,
  password  VARCHAR(40)   NOT NULL,
  name      VARCHAR(100)  NOT NULL,
  phone     VARCHAR(13),
  token     VARCHAR(32),
  PRIMARY KEY(id)
);

CREATE TABLE items(
  id          INT           AUTO_INCREMENT,
  created_at  INT(11)       NOT NULL,
  title       VARCHAR(100)  NOT NULL,
  image       VARCHAR(200)  DEFAULT 'http://example.com/image/**/*.jpg',
  price       FLOAT(30, 10) NOT NULL,
  PRIMARY KEY(id),
  user_id     INT           NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
