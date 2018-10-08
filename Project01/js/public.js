var BASE_PATH = "";
// 用户信息
var userInfo = {
    flag: false
};
$(function() {
    load_Head_Footer();
    load_Nav();
});

function load_Head_Footer() {
    $.ajax({
        url: 'common/header.html',
        type: 'get',
        async: false,
        dataType: 'html',
        success: function(data) {
            $('#header-container').html(data);
            // 查询用户信息 同步调用
            // fn_userInfo();
        }
    });
    $.ajax({
        url: 'common/footer.html',
        type: 'get',
        async: false,
        dataType: 'html',
        success: function(data) {
            $('#footer-container').html(data);
        }
    });
}

// 加载导航
function load_Nav() {
    $.ajax({
        url: 'common/nav.html',
        type: 'get',
        async: false,
        dataType: 'html',
        success: function(data) {
            $('#nav-container').html(data);
        }
    });
}

// 查询用户信息 同步调用
function fn_userInfo() {
    $.ajax({
        url: BASE_PATH + '/view/user.htmls',
        type: 'post',
        async: false,
        dataType: 'json',
        success: function(data) {
            if (data.code === 1) {
                userInfo = {
                    flag: true,
                    username: data.data.username
                };
                $("#username-span").text(userInfo.username);
                // $(".header_right_top>.name").html("<span></span>欢迎您：<span>" + userInfo.username + "</span><a id='logoutBtn' href='/logout.htmls?url="+encodeURI("common/index.html")+"'>注销</a><a id='changePWBtn' onclick='openDialChangePW()'>修改密码</a>");
                $("#hasnotlogged").hide();
                $("#alreadylogged").show();
                setTimeout(function() {
                    // topbar中，用户操作显示/隐藏
                    $("#top-useraction-box").hover(function() {
                        $(this).addClass('active');
                    }, function() {
                        $(this).removeClass('active');
                    });
                }, 0);
            } else {
                userInfo.flag = false;
                $("#hasnotlogged").show();
                $("#alreadylogged").hide();
            }

        }
    });
}
// 退出
function fn_logout() {
    window.location.href = BASE_PATH + "/logout.htmls?url=" + encodeURI('common/login.html');
}
// 位置loading遮罩
var positionLoadIndex;
// 位置select初始化（三级联动）
// type为1或默认，option添加空项【列表页搜索用】
// type为2，option不添加空项【新增时用，免得他不选】
function initPositionSelect(type) {
    type = type || 1;
    if (type == 1) {
        // 添加空项
        var html_init = '<option value=""></option>';
    } else {
        // 不添加空项
        html_init = "";
    }
    positionLoadIndex = layer.load();
    $.ajax({
        url: BASE_PATH + 'data/select2.json',
        async: false,
        data: {
            typeCode: "区"
        },
        success: function success(res) {
            var list = res.data;
            if (list && list.length > 0) {
                var html = html_init;
                $.each(list, function(index, item) {
                    html += '<option value="' + item.value + '">' + item.name + '</option>';
                });
                $("#select_qu").html(html).trigger('change');
            }
            layer.close(positionLoadIndex);
        }
    });
    $("#select_qu").change(function() {
        positionLoadIndex = layer.load();
        // 区变化加载街道
        $("#select_jiezhen").html("");
        $("#select_cun").html("");
        $.ajax({
            url: BASE_PATH + 'data/select2.json',
            data: {
                typeCode: "街镇",
                areaName: $("#select_qu").val()
            },
            success: function success(res) {
                var list = res.data;
                if (list && list.length > 0) {
                    var html = html_init;
                    $.each(list, function(index, item) {
                        html += '<option value="' + item.value + '">' + item.name + '</option>';
                    });
                    $("#select_jiezhen").html(html).trigger('change');
                }
                layer.close(positionLoadIndex);
            }
        });
    });
    $("#select_jiezhen").change(function() {
        positionLoadIndex = layer.load();
        // 区变化加载街道
        $("#select_cun").html("");
        $.ajax({
            url: BASE_PATH + 'data/select2.json',
            data: {
                typeCode: "村",
                areaName: $("#select_qu").val(),
                cityName: $("#select_jiezhen").val()
            },
            success: function success(res) {
                var list = res.data;
                if (list && list.length > 0) {
                    var html = html_init;
                    $.each(list, function(index, item) {
                        html += '<option value="' + item.value + '">' + item.name + '</option>';
                    });
                    $("#select_cun").html(html);
                }
                layer.close(positionLoadIndex);
            }
        });
    });
}
