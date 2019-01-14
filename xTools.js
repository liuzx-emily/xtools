(function() {
    var xTools = {};
    /* ------------------------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    /* ----------------------------------- 【 基础设置 START 】 ------------------------------- */
    // script标签
    var oScriptTag = $("script[src$='xTools.js']");
    // 默认引入的插件列表
    var DEFAULT_PLUGINLIST = "fontawesome layer zxtable";
    // xTools文件夹的路径（如果页面和xTools文件夹不是同级，则需要设定此值）。importFile()中会用到
    var BASE_PATH = oScriptTag.attr("fixing-address") || "xTools/";
    /* ----------------------------------- 【 基础设置  END  】 ------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    /* -------------------------------- 【 jQuery扩充方法 START 】 ---------------------------- */
    /* ------说明： 有的页面引用了自己的jQuery，会覆盖掉我引用jQ的，添加的方法都没了 ------------- */
    /* ----------- 使用 jQuery.extend(xTools.jQuery_addOns) 可以方便的再次添加 --------------- */
    xTools.jQuery_addOns = {


        /* 
         * $.zxparam_check(box)：关键属性 x_valid x_chs，需要定义全局设置 ERROR_LAYER_CONFIG
         */
        zxparam_check: function(box) {
            var errorHandle =
                'item.focus();' +
                'flag = false;';
            var flag = true;
            var arr = $(box).find("[x_valid]");
            $.each(arr, function(index, item) {
                // 验证类型
                var validType = $(item).attr("x_valid");
                // 中文提示
                var chs = $(item).attr("x_chs");
                // 值
                var val;
                if ($(item).prop("type") == 'radio') {
                    // radio
                    val = $(box).find("[x_name='" + $(item).attr('x_name') + "']:checked").val();
                } else if ($(item)[0].tagName.toUpperCase() == 'SELECT') {
                    // select
                    val = $(item).val();
                } else {
                    val = $(item).val().trim();
                    $(item).val(val);
                }
                // required：必填
                if (/_required_/.test(validType)) {
                    if ((!val) || val.length === 0) {
                        layer.msg(chs + "不能为空！", ERROR_LAYER_CONFIG);
                        eval(errorHandle);
                        return false;
                    }
                }
                // western:英文数字下划线
                if (/_western_/.test(validType)) {
                    if (val.length > 0 && !(/^[a-zA-Z0-9_]+$/.test(val))) {
                        layer.msg(chs + "必须为英文、数字、下划线！", ERROR_LAYER_CONFIG);
                        eval(errorHandle);
                        return false;
                    }
                }
                // integer 整数
                if (/_integer_/.test(validType)) {
                    if (val.length > 0 && !(/^\d+$/.test(val))) {
                        layer.msg(chs + "必须为整数！", ERROR_LAYER_CONFIG);
                        eval(errorHandle);
                        return false;
                    }
                }
                // decimal:小数
                if (/_decimal_/.test(validType)) {
                    if (val.length > 0 && !(/^(-?\d+)(\.\d+)?$/.test(val))) {
                        layer.msg(chs + "必须为数字！", ERROR_LAYER_CONFIG);
                        eval(errorHandle);
                        return false;
                    }
                }
                // equalto：相等，用于确认密码
                if (/_equalto_/.test(validType)) {
                    var twin = $(box).find("[x_name='" + $(item).attr("x_equalto") + "']");
                    if (twin.val().trim() !== val) {
                        layer.msg(chs + "和" + twin.attr("x_chs") + "必须相同！", ERROR_LAYER_CONFIG);
                        eval(errorHandle);
                        return false;
                    }
                }
                // phone
                if (/_phone_/.test(validType)) {
                    if (val.length > 0 && !(/^0\d{2,3}-?\d{7,8}$/.test(val) || /^1\d{10}$/.test(val))) {
                        layer.msg(chs + "必须为合法的固话或手机格式！", ERROR_LAYER_CONFIG);
                        eval(errorHandle);
                        return false;
                    }
                }
                // cellphone 手机
                if (/_cellphone_/.test(validType)) {
                    if (val.length > 0 && !(/^1\d{10}$/.test(val))) {
                        layer.msg(chs + "必须为合法的手机格式！", ERROR_LAYER_CONFIG);
                        eval(errorHandle);
                        return false;
                    }
                }
                // email
                if (/_email_/.test(validType)) {
                    if (val.length > 0 && !(/^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/.test(val))) {
                        layer.msg(chs + "必须为合法的邮箱格式！", ERROR_LAYER_CONFIG);
                        eval(errorHandle);
                        return false;
                    }
                }
                // 统一社会信用代码
                if (/_zzjgdm_/.test(validType)) {
                    if (val.length > 0 && !(new check_zzjgdm().verify(val))) {
                        layer.msg(chs + "必须为合法的18位统一社会信用代码格式！", ERROR_LAYER_CONFIG);
                        eval(errorHandle);
                        return false;
                    }
                }

            });
            return flag;
        },
        /* 
         * $.zxparam_get(box)：关键属性 x_name
         */
        zxparam_get: function(box) {
            var param = {};
            var arr = $(box).find("[x_name]");
            $.each(arr, function(index, item) {
                var key = $(item).attr('x_name');
                var value;
                if ($(item).prop("type") == 'radio') {
                    // radio
                    value = $(box).find("[x_name='" + key + "'][type='radio']:checked").val();
                } else if ($(item).prop("type") == 'checkbox') {
                    // checkbox
                    if ($(item).attr("x_schk") && $(item).attr("x_schk").length > 0) {
                        // 特殊的checkbox（只有一个checkbox，选中时值为A，没选中时值为B）
                        /* 用法：
                                是女孩：<input type="checkbox" x_name="isgirl" x_schk="1,0">
                           取值结果：
                                选中时为"1"，未选中时为"0"
                        */
                        var checked_value = $(item).attr("x_schk").split(",")[0];
                        var unchecked_value = $(item).attr("x_schk").split(",")[1];
                        value = $(item).prop("checked") ? checked_value : unchecked_value;
                    } else {
                        // 普通的checkbox（同一个name有多个checkbox）                    
                        /* 用法：
                                <input type="checkbox" value="游泳" name="hobby" x_name="hobby">游泳
                                <input type="checkbox" value="下棋" name="hobby" x_name="hobby">下棋
                                <input type="checkbox" value="绘画" name="hobby" x_name="hobby">绘画
                            取值结果：
                                "游泳、绘画
                        */
                        var checkbox_item_arr = [];
                        var checkbox_item_value_arr = [];
                        checkbox_item_arr = $(box).find("[x_name='" + key + "'][type='checkbox']:checked");
                        $.each(checkbox_item_arr, function(index, item) {
                            checkbox_item_value_arr.push($(item).val());
                        });
                        value = checkbox_item_value_arr.join(",");

                    }
                } else if ($(item)[0].tagName.toUpperCase() == 'SELECT') {
                    // select
                    value = $(item).val();
                } else {
                    value = $(item).val().trim();
                }

                param[key] = value;
            });
            return param;
        },
        /* 
         * $.zxparam_assign(box,param)：关键属性 x_name
         */
        zxparam_assign: function(box, param) {
            param = param || {};
            var arr = $(box).find("[x_name]");
            $.each(arr, function(index, item) {
                var key = $(item).attr('x_name');
                var value = param[key];
                if ($.checkNull(value)) {
                    if ($(item).prop("type") == 'radio') {
                        // radio
                        $(box).find("[type='radio'][x_name='" + key + "']").prop("checked", false);
                        $(box).find("[type='radio'][x_name='" + key + "'][value='" + value + "']").prop("checked", true);
                    } else if ($(item).prop("type") == 'checkbox') {
                        // checkbox
                        // 转为字符串（ 1 -> "1"）
                        value = value + "";
                        if ($(item).attr("x_schk") && $(item).attr("x_schk").length > 0) {
                            // 特殊的checkbox（只有一个checkbox，选中时值为A，没选中时值为B）
                            /* 用法：
                                    是女孩：<input type="checkbox" x_name="isgirl" x_schk="1,0">
                               取值结果：
                                    选中时为"1"，未选中时为"0"
                            */
                            var checked_value = $(item).attr("x_schk").split(",")[0];
                            var unchecked_value = $(item).attr("x_schk").split(",")[1];
                            if (value == checked_value) {
                                $(item).prop("checked", true);
                            } else {
                                $(item).prop("checked", false);
                            }
                        } else {
                            // 普通的checkbox（同一个name有多个checkbox）                    
                            /* 用法：
                                    <input type="checkbox" value="游泳" name="hobby" x_name="hobby">游泳
                                    <input type="checkbox" value="下棋" name="hobby" x_name="hobby">下棋
                                    <input type="checkbox" value="绘画" name="hobby" x_name="hobby">绘画
                                取值结果：
                                    "游泳、绘画
                            */
                            $(box).find("[type='checkbox'][x_name='" + key + "']").prop("checked", false);
                            var checkbox_item_value_arr = value.split(",");
                            $.each(checkbox_item_value_arr, function(index, item) {
                                $(box).find("[type='checkbox'][x_name='" + key + "'][value='" + item + "']").prop("checked", true);
                            });
                        }
                    } else if ($(item)[0].tagName.toUpperCase() == 'SELECT') {
                        // select
                        $(item).val(value);
                        setTimeout(function() {
                            $(item).trigger("change");
                        }, 1000);
                    } else {
                        $(item).val(value);
                        $(item).text(value);
                    }
                }
            });
        },
        /* 
         * $.zxAsk(param)
         */
        zxAsk: function(param) {
            // 打开弹窗
            layer.confirm(param.msg, { icon: 7, title: false }, param.yes);
        },
        /* 
         * $.zxDial(p)
         */
        zxDial: function(p) {
            // -------------------- 清理弹窗 --------------------
            if (!p.donnotclear) {
                clearDial(p.layer.content);
            }
            // -------------------- 打开弹窗 --------------------
            var defaults_param = {
                type: 1,
                area: ['520px', '550px'],
                btn: ['保存', '取消'],
                resize: true,
                success: function(layero, index) {
                    var mask = $(".layui-layer-shade");
                    mask.appendTo(layero.parent());
                },
            };
            layer.open($.extend({}, defaults_param, p.layer));

            // -------------------- 部门等的隐藏的innerTree --------------------
            // 隐藏innerTree
            $(".dial_innertree").hide();
            // 把之前的click事件取消掉，不然click事件会触发多次，hide-show-hide-show..
            $(".dial_innertree_triggerinput").off('click');
            // 给innerTree绑定点击事件：点一下出来，选择后消失
            $(".dial_innertree_triggerinput").on('click', function() {
                var tree = $(this).siblings('div.dial_innertree');
                if (tree.css("display") == "block") {
                    tree.hide();
                } else if (tree.css("display") == "none") {
                    tree.show();
                }
            });

            // ----------------------------------------------------
            function clearDial(oParent) {
                oParent.find("input[type='text']").not("[x_donnotclear]").val("");
                oParent.find("input[type='password']").not("[x_donnotclear]").val("");
                oParent.find("input[type='radio']").not("[x_donnotclear]").prop("checked", false);
                oParent.find("input[type='checkbox']").not("[x_donnotclear]").prop("checked", false);
            }
        },
        /* 
         * $.xguid()：(经验：$.guid不能用，这个是jqeury内部在用。用了会出错)
         */
        xguid: function() {
            var str = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0,
                    v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            return str.replace(/-/g, "");
        },
        /* 
         * $.formatDate(时间戳)：根据时间戳，返回格式化后的日期
         */
        formatDate: function(timestamp, pattern) {
            timestamp = parseInt(timestamp);
            if (pattern === undefined || pattern == 1) {
                pattern = "yyyy-MM-dd";
            } else if (pattern == 2) {
                pattern = "yyyy-MM-dd hh:mm:ss";
            }
            return new Date(timestamp).format(pattern);
        },
        /* 
         * $.initCheckboxSelectAll(全选元素，被控制元素)：多选按钮实现全选功能
         */
        initCheckboxSelectAll: function(fatherBtn, sonBtns) {
            fatherBtn = $(fatherBtn);
            sonBtns = $(sonBtns);
            fatherBtn.click(function() {
                sonBtns.prop('checked', fatherBtn.prop('checked'));
            });
            sonBtns.click(function() {
                fatherBtn.prop('checked', true);
                sonBtns.each(function(index, el) {
                    if ($(el).prop('checked') === false) {
                        fatherBtn.prop('checked', false);
                    }
                });
            });
        },
        /* 
         * $.checkNull(值)：检查值是否为undefined、null、""，是空的话返回false 
         */
        checkNull: function(value) {
            if (value === undefined || value === null || value === "") {
                return false;
            } else {
                return true;
            }
        },
        /* 
         * $.cutText(文本，长度)：裁剪文本
         */
        cutText: function(text, length) {
            if (text.length > length) {
                return text.substring(0, length - 2) + "...";
            } else {
                return text;
            }
        },
        /* 
         * $.getUrlParam(key)：从url中根据key取value。如果没有，返回null。
         * 如果参数中有中文，需要用所encodeURI()来传递           
         */
        getUrlParam: function(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r !== null) {
                //用decodeURI来解码
                return decodeURI(r[2]);
            } else {
                return null;
            }
        },
        /* 
         * $.getDaysBetween(day1,day2)：获取中间的所有日期。
         * 例子：$.getDaysBetween("2018-08-29","2018-09-03")，返回：["2018-08-29", "2018-08-30", "2018-08-31", "2018-09-01", "2018-09-02", "2018-09-03"]
         */
        getDaysBetween: function(day1, day2) {
            // 定义一天的毫秒数
            var dayMilliSeconds = 1000 * 60 * 60 * 24;
            // 获取输入日期的毫秒数
            var d1Ms = new Date(day1).getTime();
            var d2Ms = new Date(day2).getTime();
            // 定义返回值
            var ret;
            // 对日期毫秒数进行循环比较，直到d1Ms 大于等于 d2Ms 时退出循环
            // 每次循环结束，给d1Ms 增加一天
            for (d1Ms; d1Ms <= d2Ms; d1Ms += dayMilliSeconds) {

                // 如果ret为空，则无需添加","作为分隔符
                if (!ret) {
                    // 将给的毫秒数转换为Date日期
                    var day = new Date(d1Ms);

                    // 获取其年月日形式的字符串
                    ret = day.format("yyyy-MM-dd");
                } else {

                    // 否则，给ret的每个字符日期间添加","作为分隔符
                    var day = new Date(d1Ms);
                    ret = ret + ',' + day.format("yyyy-MM-dd");
                }
            }
            return ret.split(",");
        },

        /* 
         * $.getMonthsBetween(month1,month2)：获取中间的所有月份。
         * 例子：$.getMonthsBetween("2018-08-25","2018-09-07")，返回：["2018-08", "2018-09"]
         */
        getMonthsBetween: function(month1, month2) {
            var dateArry = new Array();
            var s1 = month1.split("-");
            var s2 = month2.split("-");
            var mCount = 0;
            if (parseInt(s1[0]) < parseInt(s2[0])) {
                mCount = (parseInt(s2[0]) - parseInt(s1[0])) * 12 + parseInt(s2[1]) - parseInt(s1[1]) + 1;
            } else {
                mCount = parseInt(s2[1]) - parseInt(s1[1]) + 1;
            }
            if (mCount > 0) {
                var startM = parseInt(s1[1]);
                var startY = parseInt(s1[0]);
                for (var i = 0; i < mCount; i++) {
                    if (startM < 12) {
                        dateArry[i] = startY + "-" + (startM > 9 ? startM : "0" + startM);
                        startM += 1;
                    } else {
                        dateArry[i] = startY + "-" + (startM > 9 ? startM : "0" + startM);
                        startM = 1;
                        startY += 1;
                    }
                }
            }
            return dateArry;
        },
        /* 
         * $.getFirstDayOfMonth(date)：获取当月第一天
         */
        getFirstDayOfMonth: function(date) {
            if (date) {
                date = new Date(date)
            } else {
                date = new Date()
            }
            date.setDate(1);
            return date;
        },
        /* 
         * $.getFirstDayOfSeason(date)：获取当季第一天
         */
        getFirstDayOfSeason: function(date) {
            if (date) {
                date = new Date(date)
            } else {
                date = new Date()
            }
            var month = date.getMonth();
            if (month < 3) {
                date.setMonth(0);
            } else if (2 < month && month < 6) {
                date.setMonth(3);
            } else if (5 < month && month < 9) {
                date.setMonth(6);
            } else if (8 < month && month < 11) {
                date.setMonth(9);
            }
            date.setDate(1);
            return date;
        },
        /* 
         * $.getFirstDayOfYear(date)：获取当年第一天
         */
        getFirstDayOfYear: function(date) {
            if (date) {
                date = new Date(date)
            } else {
                date = new Date()
            }
            date.setDate(1);
            date.setMonth(0);
            return date;
        }
    };
    /* -------------------------------- 【 jQuery扩充方法  END  】 ---------------------------- */
    /* ------------------------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    /* ------------------- 【 xTools所有插件列表(为了方便在F12中查看) START】 ------------------- */
    xTools.allPlugins = [{
        name: "fontawesome",
        folder: "01_font-awesome",
        description: "图标库"
    }, {
        name: "layer",
        folder: "02_layer",
        description: "弹窗"
    }, {
        name: "laydate",
        folder: "03_laydate",
        description: "日期时间选择器"
    }, {
        name: "kindeditor",
        folder: "04_kindeditor",
        description: "富文本编辑器"
    }, {
        name: "ztree",
        folder: "05_zTree",
        description: "树"
    }, {
        name: "echarts2",
        folder: "06_echarts-2.2.7",
        description: "echarts2兼容IE8"
    }, {
        name: "mindmap",
        folder: "07_Mindmap-Tree",
        description: "思维导图（数据驱动）"
    }, {
        name: "jq22page",
        folder: "08_pagination",
        description: "jq22中找到的分页,使用说明 http://www.jq22.com/yanshi5697 "
    }, {
        name: "zxtable",
        folder: "09_zxTable",
        description: "自己写的，带有分页、搜索、排序、多选等功能的表格"
    }, {
        name: "select2",
        folder: "10_select2",
        description: "下拉框，支持ie9+"
    }, {
        name: "webuploader",
        folder: "11_webuploader",
        description: "上传"
    }, {
        name: "switch",
        folder: "12_simpleswitch",
        description: "jq22中找到的开关，使用说明 http://www.jq22.com/demo/simple_switch20160802/ "
    }, {
        name: "zxtreetable",
        folder: "13_zxTreetable",
        description: "自己写的，treetable"
    }];
    /* ------------------ 【 xTools所有插件列表(为了方便在F12中查看)  END 】 -------------------- */
    /* ------------------------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    /* ------------------------------------ 【 初始化 START 】 -------------------------------  */
    // 引入lodash
    importFile("00_/lodash.js");
    // 引入插件
    importPlugins();
    // 引入样式重置和预设的css
    importFile("00_/reset.css");
    /* ------------------------------------ 【 初始化  END  】 -------------------------------  */
    /* ------------------------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    /* ----------------------------- 【 内部功能函数，不对外开放 START 】 ---------------------- */
    // 引入js或css文件
    function importFile(filename) {
        var html = "";
        if (/.js$/.test(filename)) {
            html = '<script src="' + BASE_PATH + filename + '"></script>';
        } else if (/.css$/.test(filename)) {
            html = '<link rel="stylesheet" href="' + BASE_PATH + filename + '">';
        }
        /* 用 $("body").append(html);不行。原因：
           (1)本地调试时会跨域报错 (2)如果xTools在head中引用，那么此时body还没加载出来,append不了 */
        document.write(html);
    }
    // 引入插件
    function importPlugins() {
        var pluginList = DEFAULT_PLUGINLIST;
        // 如果script标签中有属性more-plugins
        (oScriptTag.attr('more-plugins')) && (pluginList += " " + oScriptTag.attr('more-plugins'));
        // 01 fontawesome 图标库font-awesome
        (/\bfontawesome\b/i.test(pluginList)) && (
            importFile("01_font-awesome/css/font-awesome.min.css")
        );
        // 02 layer
        (/\blayer\b/i.test(pluginList)) && (
            importFile("02_layer/layer.js")
        );
        // 03 laydate
        (/\blaydate\b/i.test(pluginList)) && (
            importFile("03_laydate/laydate.js")
        );
        // 04 kindeditor
        (/\bkindeditor\b/i.test(pluginList)) && (
            importFile("04_kindeditor/kindeditor-all.js"),
            importFile("04_kindeditor/lang/zh-CN.js")
        );
        // 05 ztree
        (/\bztree\b/i.test(pluginList)) && (
            importFile("05_zTree/css/metroStyle/metroStyle.css"),
            importFile("05_zTree/js/jquery.ztree.all.js")
        );
        // 06 echarts2
        (/\becharts2\b/i.test(pluginList)) && (
            importFile("06_echarts-2.2.7/build/dist/echarts-all.js")
        );
        // 07 mindmap 思维导图
        (/\bmindmap\b/i.test(pluginList)) && (
            document.write('<script src="xTools/07_Mindmap-Tree/js/packages/bower/requirejs/require.js" data-main="xTools/07_Mindmap-Tree/js/main.js"></script>')
        );
        // 08 jq22page 分页 使用说明 http://www.jq22.com/yanshi5697
        (/\bjq22page\b/i.test(pluginList)) && (
            importFile("08_pagination/pagination.css"),
            importFile("08_pagination/jquery.pagination.js")
        );
        // 09 zxtable 表格
        (/\bzxtable\b/i.test(pluginList)) && (
            // importFile("09_zxTable/zxTable.dev.js")
            importFile("09_zxTable/zxTable.js")

        );
        // 10 select 表格
        (/\bselect2\b/i.test(pluginList)) && (
            importFile("10_select2/css/select2.css"),
            importFile("10_select2/js/select2.full.min.js"),
            importFile("10_select2/js/i18n/zh-CN.js")
        );
        // 11 webuploader 上传
        (/\bwebuploader\b/i.test(pluginList)) && (
            importFile("11_webuploader/webuploader.css"),
            importFile("11_webuploader/zx-customedStyle/fileIcon.css"),
            importFile("11_webuploader/zx-customedStyle/uploadBox.css"),
            importFile("11_webuploader/webuploader.min.js")
        );
        // 12 switch 开关 使用说明 http://www.jq22.com/demo/simple_switch20160802/
        (/\bswitch\b/i.test(pluginList)) && (
            importFile("12_simpleswitch/simple.switch.css"),
            importFile("12_simpleswitch/simple.switch.js")
        );
        // 12 zxtreetable 
        (/\bzxtreetable\b/i.test(pluginList)) && (
            // importFile("13_zxTreetable/zxTreetable.dev.js"),
            importFile("13_zxTreetable/zxTreetable.js")
        );
    }
    /* ----------------------------- 【 内部功能函数，不对外开放  END  】 ---------------------- */
    /* ------------------------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    /* ------------------------------------------------------------------------------------- */
    // 暴露给外部
    window.xTools = window.$$ = xTools;
})();


jQuery.extend(xTools.jQuery_addOns);

/* ------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------- */
/* ---------------------------- 【 Date方法扩展 START 】 ---------------------------------- */
// new Date().format("yyyy-MM-dd hh:mm:ss")：日期格式化
Date.prototype.format = function(formatStr) {
    var str = formatStr;
    var Week = ['日', '一', '二', '三', '四', '五', '六'];
    str = str.replace(/yyyy/i, this.getFullYear());
    str = str.replace(/yy/gi, (this.getYear() % 100) > 9 ? (this.getYear() % 100).toString() : '0' + (this.getYear() % 100));
    var month = this.getMonth() + 1;
    str = str.replace(/MM/, month > 9 ? month.toString() : '0' + month);
    str = str.replace(/M/g, month);
    str = str.replace(/w|W/g, Week[this.getDay()]);
    str = str.replace(/dd/i, this.getDate() > 9 ? this.getDate().toString() : '0' + this.getDate());
    str = str.replace(/d/gi, this.getDate());
    str = str.replace(/hh/i, this.getHours() > 9 ? this.getHours().toString() : '0' + this.getHours());
    str = str.replace(/h/ig, this.getHours());
    str = str.replace(/mm/, this.getMinutes() > 9 ? this.getMinutes().toString() : '0' + this.getMinutes());
    str = str.replace(/m/g, this.getMinutes());
    str = str.replace(/ss/i, this.getSeconds() > 9 ? this.getSeconds().toString() : '0' + this.getSeconds());
    str = str.replace(/s/ig, this.getSeconds());
    return str;
};
/* ---------------------------- 【 Date方法扩展  END  】 ---------------------------------- */
/* ------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------- */
/* -------------------------- 【 String方法扩展 START 】 ---------------------------------- */
// trim()：删除字符串两端的空白字符，返回一个新字符串（不改变原字符串）
if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
}
/* -------------------------- 【 String方法扩展  END  】 ---------------------------------- */
/* ------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------- */
/* -------------------------- 【 Array方法扩展 START 】 ----------------------------------- */
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(callback /*, thisArg*/ ) {

        var T, k;

        if (this == null) {
            throw new TypeError('this is null or not defined');
        }

        // 1. Let O be the result of calling toObject() passing the
        // |this| value as the argument.
        var O = Object(this);

        // 2. Let lenValue be the result of calling the Get() internal
        // method of O with the argument "length".
        // 3. Let len be toUint32(lenValue).
        var len = O.length >>> 0;

        // 4. If isCallable(callback) is false, throw a TypeError exception. 
        // See: http://es5.github.com/#x9.11
        if (typeof callback !== 'function') {
            throw new TypeError(callback + ' is not a function');
        }

        // 5. If thisArg was supplied, let T be thisArg; else let
        // T be undefined.
        if (arguments.length > 1) {
            T = arguments[1];
        }

        // 6. Let k be 0.
        k = 0;

        // 7. Repeat while k < len.
        while (k < len) {

            var kValue;

            // a. Let Pk be ToString(k).
            //    This is implicit for LHS operands of the in operator.
            // b. Let kPresent be the result of calling the HasProperty
            //    internal method of O with argument Pk.
            //    This step can be combined with c.
            // c. If kPresent is true, then
            if (k in O) {

                // i. Let kValue be the result of calling the Get internal
                // method of O with argument Pk.
                kValue = O[k];

                // ii. Call the Call internal method of callback with T as
                // the this value and argument list containing kValue, k, and O.
                callback.call(T, kValue, k, O);
            }
            // d. Increase k by 1.
            k++;
        }
        // 8. return undefined.
    };
}
if (!Array.prototype.map) {
    Array.prototype.map = function(callback /*, thisArg*/ ) {

        var T, A, k;

        if (this == null) {
            throw new TypeError('this is null or not defined');
        }

        // 1. Let O be the result of calling ToObject passing the |this| 
        //    value as the argument.
        var O = Object(this);

        // 2. Let lenValue be the result of calling the Get internal 
        //    method of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = O.length >>> 0;

        // 4. If IsCallable(callback) is false, throw a TypeError exception.
        // See: http://es5.github.com/#x9.11
        if (typeof callback !== 'function') {
            throw new TypeError(callback + ' is not a function');
        }

        // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 1) {
            T = arguments[1];
        }

        // 6. Let A be a new array created as if by the expression new Array(len) 
        //    where Array is the standard built-in constructor with that name and 
        //    len is the value of len.
        A = new Array(len);

        // 7. Let k be 0
        k = 0;

        // 8. Repeat, while k < len
        while (k < len) {

            var kValue, mappedValue;

            // a. Let Pk be ToString(k).
            //   This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the HasProperty internal 
            //    method of O with argument Pk.
            //   This step can be combined with c
            // c. If kPresent is true, then
            if (k in O) {

                // i. Let kValue be the result of calling the Get internal 
                //    method of O with argument Pk.
                kValue = O[k];

                // ii. Let mappedValue be the result of calling the Call internal 
                //     method of callback with T as the this value and argument 
                //     list containing kValue, k, and O.
                mappedValue = callback.call(T, kValue, k, O);

                // iii. Call the DefineOwnProperty internal method of A with arguments
                // Pk, Property Descriptor
                // { Value: mappedValue,
                //   Writable: true,
                //   Enumerable: true,
                //   Configurable: true },
                // and false.

                // In browsers that support Object.defineProperty, use the following:
                // Object.defineProperty(A, k, {
                //   value: mappedValue,
                //   writable: true,
                //   enumerable: true,
                //   configurable: true
                // });

                // For best browser support, use the following:
                A[k] = mappedValue;
            }
            // d. Increase k by 1.
            k++;
        }

        // 9. return A
        return A;
    };
}
if (!Array.prototype.reduce) {
    Array.prototype.reduce = function(callback /*, initialValue*/ ) {
        if (this === null) {
            throw new TypeError('Array.prototype.reduce ' +
                'called on null or undefined');
        }
        if (typeof callback !== 'function') {
            throw new TypeError(callback +
                ' is not a function');
        }

        // 1. Let O be ? ToObject(this value).
        var o = Object(this);

        // 2. Let len be ? ToLength(? Get(O, "length")).
        var len = o.length >>> 0;

        // Steps 3, 4, 5, 6, 7      
        var k = 0;
        var value;

        if (arguments.length >= 2) {
            value = arguments[1];
        } else {
            while (k < len && !(k in o)) {
                k++;
            }

            // 3. If len is 0 and initialValue is not present,
            //    throw a TypeError exception.
            if (k >= len) {
                throw new TypeError('Reduce of empty array ' +
                    'with no initial value');
            }
            value = o[k++];
        }

        // 8. Repeat, while k < len
        while (k < len) {
            // a. Let Pk be ! ToString(k).
            // b. Let kPresent be ? HasProperty(O, Pk).
            // c. If kPresent is true, then
            //    i.  Let kValue be ? Get(O, Pk).
            //    ii. Let accumulator be ? Call(
            //          callbackfn, undefined,
            //          « accumulator, kValue, k, O »).
            if (k in o) {
                value = callback(value, o[k], k, o);
            }

            // d. Increase k by 1.      
            k++;
        }

        // 9. Return accumulator.
        return value;
    }
}
if (!Array.prototype.filter) {
    Array.prototype.filter = function(func, thisArg) {
        if (!((typeof func === 'Function' || typeof func === 'function') && this))
            throw new TypeError();

        var len = this.length >>> 0,
            res = new Array(len), // preallocate array
            t = this,
            c = 0,
            i = -1;
        if (thisArg === undefined) {
            while (++i !== len) {
                // checks to see if the key was set
                if (i in this) {
                    if (func(t[i], i, t)) {
                        res[c++] = t[i];
                    }
                }
            }
        } else {
            while (++i !== len) {
                // checks to see if the key was set
                if (i in this) {
                    if (func.call(thisArg, t[i], i, t)) {
                        res[c++] = t[i];
                    }
                }
            }
        }

        res.length = c; // shrink down array to proper size
        return res;
    };
}
if (!Array.prototype.every) {
    Array.prototype.every = function(callbackfn, thisArg) {
        'use strict';
        var T, k;

        if (this == null) {
            throw new TypeError('this is null or not defined');
        }

        // 1. Let O be the result of calling ToObject passing the this 
        //    value as the argument.
        var O = Object(this);

        // 2. Let lenValue be the result of calling the Get internal method
        //    of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = O.length >>> 0;

        // 4. If IsCallable(callbackfn) is false, throw a TypeError exception.
        if (typeof callbackfn !== 'function') {
            throw new TypeError();
        }

        // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 1) {
            T = thisArg;
        }

        // 6. Let k be 0.
        k = 0;

        // 7. Repeat, while k < len
        while (k < len) {

            var kValue;

            // a. Let Pk be ToString(k).
            //   This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the HasProperty internal 
            //    method of O with argument Pk.
            //   This step can be combined with c
            // c. If kPresent is true, then
            if (k in O) {

                // i. Let kValue be the result of calling the Get internal method
                //    of O with argument Pk.
                kValue = O[k];

                // ii. Let testResult be the result of calling the Call internal method
                //     of callbackfn with T as the this value and argument list 
                //     containing kValue, k, and O.
                var testResult = callbackfn.call(T, kValue, k, O);

                // iii. If ToBoolean(testResult) is false, return false.
                if (!testResult) {
                    return false;
                }
            }
            k++;
        }
        return true;
    };
}
if (!Array.prototype.some) {
    Array.prototype.some = function(fun, thisArg) {
        'use strict';

        if (this == null) {
            throw new TypeError('Array.prototype.some called on null or undefined');
        }

        if (typeof fun !== 'function') {
            throw new TypeError();
        }

        var t = Object(this);
        var len = t.length >>> 0;

        for (var i = 0; i < len; i++) {
            if (i in t && fun.call(thisArg, t[i], i, t)) {
                return true;
            }
        }

        return false;
    };
}
if (!Array.prototype.includes) {
    Array.prototype.includes = function(searchElement, fromIndex) {

        // 1. Let O be ? ToObject(this value).
        if (this == null) {
            throw new TypeError('"this" is null or not defined');
        }

        var o = Object(this);

        // 2. Let len be ? ToLength(? Get(O, "length")).
        var len = o.length >>> 0;

        // 3. If len is 0, return false.
        if (len === 0) {
            return false;
        }

        // 4. Let n be ? ToInteger(fromIndex).
        //    (If fromIndex is undefined, this step produces the value 0.)
        var n = fromIndex | 0;

        // 5. If n ≥ 0, then
        //  a. Let k be n.
        // 6. Else n < 0,
        //  a. Let k be len + n.
        //  b. If k < 0, let k be 0.
        var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

        // 7. Repeat, while k < len
        while (k < len) {
            // a. Let elementK be the result of ? Get(O, ! ToString(k)).
            // b. If SameValueZero(searchElement, elementK) is true, return true.
            // c. Increase k by 1.
            // NOTE: === provides the correct "SameValueZero" comparison needed here.
            if (o[k] === searchElement) {
                return true;
            }
            k++;
        }

        // 8. Return false
        return false;
    }
}
if (!Array.prototype.convert_to_treedata) {
    Array.prototype.convert_to_treedata = function(param) {
        param = param || {};
        before_idkey = param.before_idkey || "id";
        before_parentkey = param.before_parentkey || "parentId";
        after_childkey = param.after_childkey || "child";
        var dataArr = this;
        let tree = dataArr.filter((father) => {
            //循环所有项
            let branchArr = dataArr.filter((child) => {
                //返回每一项的子级数组        
                return father[before_idkey] == child[before_parentkey]
            });
            if (branchArr.length > 0) {
                //如果存在子级，则给父级添加一个child属性，并赋值        
                father[after_childkey] = branchArr;
            }
            //返回没有父级的
            return !(dataArr.some(function(item) {
                return item[before_idkey] === father[before_parentkey];
            }));
        });
        //返回树形数据
        return tree;
    }
}

/* -------------------------- 【 Array方法扩展  END  】 ----------------------------------- */
/* ------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------------------- */