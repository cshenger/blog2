$(function() {
  var $login = $('#login');
  var $register = $('#register');
  var $userInfo = $('#userInfo');

  $login.find('a.colMint').on('click', function() {
    $register.show();
    $login.hide();
  });

  $register.find('a.colMint').on('click', function() {
    $login.show();
    $register.hide();
  });

  $register.find('button').on('click', function() {
    $.ajax({
      type: 'post',
      url: '/api/user/register',
      data: {
        username: $register.find('[name="username"]').val(),
        password: $register.find('[name="password"]').val(),
        repassword: $register.find('[name="repassword"]').val()
      },
      dataType: 'json',
      success: function(result) {
        $register.find('.colWarning').html(result.message);
        if (!result.code) {
          setTimeout(function() {
            $login.show();
            $register.hide();
          }, 1000);
        }
      }
    });
  });

  $login.find('button').on('click', function() {
    console.log('login');
    $.ajax({
      type: 'post',
      url: '/api/user/login',
      data: {
        username: $login.find('[name="username"]').val(),
        password: $login.find('[name="password"]').val()
      },
      dataType: 'json',
      success: function(result) {
        $login.find('.colWarning').html(result.message);
        if (!result.code) {
          // 登陆成功
          window.location.reload();
        }
      }
    });
  });

  // logoutBtn
  $('#logoutBtn').on('click', function () {
    $.ajax({
      url: '/api/user/logout',
      success: function(result) {
        if (!result.code) {
          window.location.reload();
        }
      }
    });
  });

});
