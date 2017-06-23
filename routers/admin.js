var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Category = require('../models/Category');
var Content = require('../models/Content');

router.use(function(req, res, next) {
  if  (!req.userInfo.isAdmin) {
    res.send("sorry，只有管理员有权访问");
    return;
  }
  next();
});

// 首页
router.get('/', function(req, res, next) {
  res.render('admin/index', {
    userInfo: req.userInfo
  });
});

// 用户管理
router.get('/user', function(req, res, next) {

  // 从数据库中读取用户数据
  var page = Number(req.query.page || 1);
  var limit = 2;
  var pages = 0;

  User.count().then(function(count) {
    // 计算总页数
    pages = Math.ceil(count / limit);
    // 规定页数的最大与最小值
    page = Math.min(page, pages);
    page = Math.max(page, 1);
    var skip = (page - 1) * limit;

    User.find().limit(limit).skip(skip).then(function(users) {
      res.render('admin/user_index', {
        userInfo: req.userInfo,
        users: users,
        count: count,
        pages: pages,
        limit: limit,
        page: page
      });
    });
  });

});

//----------------------------------------------------------------

// 分类
router.get('/category', function (req, res) {
    /*res.render('admin/category_index',{
        userInfo: req.userInfo
    })*/

    var page = Number(req.query.page || 1)
    var limit = 2
    var pages = 0;  //总页数

    Category.count().then(function (count){
        pages = Math.ceil( count/limit )
        page = Math.min(page, pages)    //取值不能超过总页数pages
        page = Math.max(page, 1)        //取值不能小于1
        var skip = (page - 1)*limit

        Category.find().sort({_id: -1}).limit(limit).skip(skip).then(function (categories) {
            res.render('admin/category_index', {
                userInfo:req.userInfo,
                categories: categories,
                page:page,
                limit:limit,
                count:count,
                pages:pages
            })
        })
    })

})

// 添加分类
router.get('/category/add', function(req, res) {
  res.render('admin/category_add', {
    userInfo: req.userInfo
  });
});

// 分累的保存
router.post("/category/add", function(req, res) {

  var name = req.body.name || '';
  if (name == '') {
    res.render('admin/error', {
      userInfo: req.userInfo,
      message: '名称不能为空'
    });
    return;
  }

  // 数据库是否存在相同内容
  Category.findOne({
    name: name
  }).then(function(rs) {
    if (rs) {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: '分类已经存在了'
      })
      return Promise.reject();
    } else {
      // 数据库中不存在
      return new Category({
        name: name
      }).save();
    }
  }).then(function(newCategory) {
    res.render('admin/success', {
      userInfo: req.userInfo,
      message: '分类保存成功',
      url: '/admin/category'
    });
  })

});

// 分类修改展示
router.get('/category/edit', function(req, res) {
  var id = req.query.id || '';
  Category.findOne({
    _id: id
  }).then(function(category) {
    if (!category) {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: '分类信息不存在'
      });
    } else {
      res.render('admin/category_edit', {
        userInfo: req.userInfo,
        category: category
      });
    }
  });
});

// 分类修改
router.post('/category/edit', function (req, res) {
    //获取要修改的分类信息，并且用表单的形式展现出来
    var id = req.query.id || ''
    //获取post提交过来的名称
    var name = req.body.name || ''

    Category.findOne({
        _id:id
    }).then(function (category) {
        if(!category){
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '分类信息不存在'
            })
            return Promise.reject()
        }else {
            //当用户没有做任何的修改提交的时候
            if (name == category.name ){
                res.render('admin/success', {
                    userInfo: req.userInfo,
                    message: '分类信息修改成功',
                    url:'/admin/category'
                })
                return Promise.reject()
            }else{
                //要修改的分类名称是否已经在数据库中存在
                return Category.findOne({
                    _id: {$ne: id},
                    name: name
                })
            }
        }
    }).then(function (sameCategory) {
        if (sameCategory){
            res.render('admin/error', {
                userInfo: req.userInfo,
                message:'数据库中已经存在同名分类'
            })
            return Promise.reject()
        }else {
            return Category.update({
                _id:id
            },{
                name:name
            })
        }
    }).then(function () {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '分类信息修改成功',
            url:'/admin/category'
        })
    });

});

// 分类删除
router.get('/category/delete', function(req, res) {
  var id = req.query.id || '';

  Category.remove({
    _id: id
  }).then(function() {
    res.render('admin/success', {
      userInfo: req.userInfo,
      message: '删除成功',
      url: '/admin/category'
    });
  });
});

//----------------------------------------------------------------

// 内容首页
router.get('/content', function (req, res) {
    var page = Number(req.query.page || 1)
    var limit = 5
    var pages = 0;  //总页数

    Content.count().then(function (count){
        pages = Math.ceil( count/limit )
        page = Math.min(page, pages)    //取值不能超过总页数pages
        page = Math.max(page, 1)        //取值不能小于1
        var skip = (page - 1)*limit

        Content.find().sort({_id: -1}).limit(limit).skip(skip).populate(['category','user']).sort({addTime: -1}).then(function (contents) {
            // console.log(contents);
            res.render('admin/content_index', {
                userInfo:req.userInfo,
                contents: contents,

                page:page,
                limit:limit,
                count:count,
                pages:pages
            })
        })
    })
});

// 添加内容
router.get('/content/add', function(req, res) {

  Category.find().sort({_id: -1}).then(function(categories) {
    res.render('admin/content_add', {
      userInfo: req.userInfo,
      categories: categories
    });
  });

});

// 保存内容
router.post('/content/add', function(req, res) {
  if (req.body.category == '') {
    res.render('admin/error', {
      userInfo: req.userInfo,
      message: '内容分类不能为空'
    });
    return;
  }

  if (req.body.title == '') {
    res.render('admin/error', {
      userInfo: req.userInfo,
      message: '内容标题不能为空'
    });
    return;
  }

  // 保存数据导数据库
  new Content({
        category:req.body.category,
        title:req.body.title,
        user: req.userInfo._id.toString(),
        description:req.body.description,
        content:req.body.content
    }).save().then(function () {
        res.render('admin/success', {
            userInfo:req.userInfo,
            message:'内容保存成功',
            url:'/admin/content'
        })
    });
});

// 修改内容
router.get('/content/edit', function(req, res) {
  var id = req.query.id || '';
  var categories = [];

  Category.find().sort({_id: -1}).then(function (rs) {
    categories = rs;
    return Content.findOne({
      _id: id
    }).populate('category');
  }).then(function(content) {
    if  (!content) {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: '内容不存在'
      });
      return Promise.reject();
    } else {
      res.render('admin/content_edit', {
        userInfo: req.userInfo,
        categories: categories,
        content: content
      });
    }
  });

});

// 保存内容修改
router.post('/content/edit', function(req, res) {
  var id = req.query.id || '';

  if (req.body.category == ''){
      res.render('admin/error',{
          userInfo:req.userInfo,
          message:'内容的分类不能为空'
      })
      return
  }
  if (req.body.title == ''){
      res.render('admin/error',{
          userInfo:req.userInfo,
          message:'内容的标题不能为空'
      })
      return
  }

  Content.update({
    _id: id
  }, {
    category:req.body.category,
    title:req.body.title,
    description:req.body.description,
    content:req.body.content
  }).then(function() {
    res.render('admin/success',{
        userInfo:req.userInfo,
        message:'保存成功',
        //url:'/admin/content/edit?id=' + id
        url:'/admin/content'
    });
  })
});

// 内容删除
router.get('/content/delete', function(req, res) {
  var id = req.query.id || '';
  Content.remove({
    _id: id
  }).then(function() {
    res.render('admin/success', {
      userInfo: req.userInfo,
      message: "内容删除成功",
      url: '/admin/content'
    });
  });
});

module.exports = router;
