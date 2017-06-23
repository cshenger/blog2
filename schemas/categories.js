var mongoose = require('mongoose');

// 分类的表结构
// 真正操作数据库的时候不接触表，而是操作更抽象一层的表模型
module.exports = new mongoose.Schema({
  name: String
});
