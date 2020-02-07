const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'mydbhost',
  port: 0,
  user: 'myusername',
  password: 'mypassword',
  database: 'mydatabase'
});

connection.connect(err => {
  if (!err) {
    console.log('数据库连接成功！');
  } else {
    console.log('数据库连接失败，' + err);
  }
});

module.exports.closeDataBase = function () {
  connection.end(err => {
    if (!err) {
      console.log('数据库连接关闭！');
    }
  });
};

module.exports.addData = function ({code, name, pCode}) {
  connection.query('INSERT INTO area_code_list SET ?', {code, name, type: 3, 'p_code': pCode}, err => {
    if (err) {
      console.log(err);
    } else {
      // console.log(`区县${name}写入数据库成功！`)
    }
  });
};

module.exports.getData = function () {
  connection.query('SELECT FROM area_code_list', (err, data) => {
    if (!err) {
      console.log('data', data);
    } else {
      console.log('error', err);
    }
  });
};