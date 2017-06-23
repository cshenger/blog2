var mongoose = require('mongoose');

// 用户表结构
// 真正操作数据库的时候不接触表，而是操作更抽象一层的表模型
module.exports = new mongoose.Schema({
  username: String,
  password: String,
  isAdmin: {
    type: Boolean,
    default: false
  }
});
