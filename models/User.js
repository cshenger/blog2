var mongoose = require('mongoose');
var usersSchema = require('../schemas/users');

// 生成表模型
module.exports = mongoose.model('User', usersSchema);
