function zxTreetable(params) {
    // 数据【必填】
    this.data = params.data;
    // 数据中的id和child修正
    this.idKey = params.idKey || "id";
    this.childKey = params.childKey || "child";

    // 容器ID【必填】
    this.container = $("#" + params.id);

    // 标题行【必填】
    this.title = params.title;

    // 是否开启多选
    this.selection = params.selection || false;


    this.init();
}
zxTreetable.prototype = {

    /*
     *      
     *  --------- 0 "对外"的函数 ---------  
     
     *   【使用本组件时，可能会调用的函数。】
     *   get_selected：获取所有已选项 
     *  
     *  ------------------------------ 
     *      
     */
    // 获取所有已选项("对外")
    get_selected: function(name) {
        var arr = [];
        $.each(this.selected_info, function(index, info) {
            arr.push(info[name]);
        });
        return arr;
    },

    /*
     *      
     *  --------- 1 核心函数 --------- 
     *      
     *   init()：初始化函数
     *   build_html()：搭建html（包括table+分页）
     *   bind_events()：绑定所有事件
     *   
     *  ---------------------------------- 
     *      
     */
    // 初始化函数
    init: function() {
        // 添加css
        if ($('style#zxTreetable_css').length === 0) {
            this.add_style();
        }
        this.build_html();
        this.bind_events();

    },
    // 搭建html（包括table+分页）
    build_html: function() {
        var add_row = function(data, index, parentId, level) {

            var levelRelatedClass = ""

            if (data[_this.childKey] && data[_this.childKey].length > 0) {
                levelRelatedClass = "has_son";
            }
            table_html += `
                    <tr  class="${levelRelatedClass}" data_id="${data[_this.idKey]}" data_parentid="${parentId}">
                        ${_this.selection===true?`
                        <td class="x-checkbox">
                            <input type="checkbox" name="x-input-checkbox">
                        </td>`:``}`;
            $.each(_this.title, function(_index, each_title) {
                if (each_title.crud) {
                    // 是"操作类"单元格：detail列 和增删改查列
                    // 添加crud属性，不添加title属性
                    // 不需要key，需要formatter，formatter的参数为index，取到每行数据
                    table_html += '<td crud>' + each_title.formatter(data) + '</td>';
                } else {
                    // 普通单元格(不添加crud属性，添加title属性)
                    var td_data = data[each_title.key];
                    if (each_title.formatter) {
                        // 如果有formatter，用formatter处理
                        td_data = each_title.formatter(td_data, index);
                    } else {
                        // 没有formatter取格式化，用processNull走一遍，处理值为null的项
                        td_data = _this.fn_processNull(td_data, each_title.processNull);
                    }
                    if (_index === 0) {
                        // 每行的第一个td，有缩进
                        let icon_html;
                        let indent;
                        if (levelRelatedClass === "has_son") {
                            // 有子级
                            icon_html = '<i class="fa fa-chevron-down control_i"></i>';
                            indent = 35 * level;
                        } else {
                            // 没有子级
                            icon_html = "";
                            indent = 35 * level+20;
                        }
                        table_html += `<td title="${td_data}" class="controltd" style="padding-left:${15+indent}px">${icon_html}${td_data}</td>`;
                    } else {
                        // 普通td
                        table_html += `<td title="${td_data}">${td_data}</td>`;
                    }
                }
            });
            table_html += `</tr>`;
            // 递归生成child们
            if (data[_this.childKey] && data[_this.childKey].length > 0) {
                data[_this.childKey].forEach(function(item, index) {
                    add_row(item, index, data[_this.idKey], level + 1);
                });
            }
        };
        var _this = this;
        var table_html = `
        <table class="zxtreetable">
            <thead>
                <tr>
                    ${_this.selection===true?`<th width="5%" class="x-checkbox"><input type="checkbox" name="x-input-checkbox-all"></th>`:""}`;
        $.each(_this.title, function(index, each_title) {
            var attr_width = each_title.width ? `width="${each_title.width}%"` : "";
            var attr_key = each_title.key ? `keyName="${each_title.key}"` : '';
            table_html += `<th ${attr_width} ${attr_key}>${each_title.name}</th>`;
        });
        table_html += `
                </tr>
            </thead>
            <tbody>`;
        if (_this.data.length === 0) {
            // 无数据
            table_html += `<tr><td colspan="999" style="font-weight:bold;">暂无数据!</td></tr>`;
        } else {
            $.each(_this.data, function(index, each_data) {
                add_row(each_data, index, "", 0);
            });
        }
        table_html += `</tbody>
        </table>`;
        _this.container.html(table_html);
    },
    // 绑定所有事件
    bind_events: function() {
        // 绑定单选、多选
        var _this = this;
        setTimeout(function() {
            _this.bind_event_collapse();
            _this.bind_event_select();
        }, 0);
    },
    /*
     *      
     *  --------- 2 非核心逻辑函数 ---------
     *  
     *   add_style()：添加css样式，加在style标签中，style标签放到body末尾
     *   bind_event_collapse()：【绑定事件】收缩、展开效果
     *   bind_event_select()：【绑定事件】单选、多选效果
     *  
     *  ------------------------------ 
     *      
     */
    // 添加css样式：加在style标签中，style标签放到body末尾
    add_style: function() {
        var style = `
        <!-- table组件的css -->
        <style id="zxTreetable_css">
        table.zxtreetable {
            border-collapse: collapse;
            width: 100%;
            border: none;
            box-shadow: #ccc 1px 1px 3px;
        }
        table.zxtreetable thead{
            border:1px solid #3f627d;
        }
        table.zxtreetable tbody{
            border:1px solid #ccc;
            border-top:none;
        }
        /* 控制展开收缩的td */
        table.zxtreetable .controltd{
            text-align:left!important;
        }
        /* 控制展开收缩的icon */
        table.zxtreetable .control_i{
           padding: 5px;
           cursor: pointer;
           position: relative;
           left: -4px;
        }
        /* 隔行变色 */
        table.zxtreetable tbody tr:nth-child(odd){
            background: #fbfbfb;
        }
        table.zxtreetable tbody tr:nth-child(even){
            background: #f5f5f5;
        }
        /* 每行的鼠标悬浮效果 */
        table.zxtreetable tbody tr:hover,table.zxtreetable tbody tr:nth-child(even):hover{
            background:#eee;
        }        
        /*th*/
        table.zxtreetable th{
            background: #3f627d;
            color: #fff;
            text-align: center;
            height: 30px;            
            font-size: 13px;
            padding: 0;
        }
        /*td*/
        table.zxtreetable td{
            color: #646464;
            text-align: center;
            height: 35px;
            font-size: 14px;
            padding: 0;
            border: 1px solid #e5e5e5;
        }
        /*多选时，表头的全选按钮*/
        table.zxtreetable thead input[name="x-input-checkbox-all"]{
            margin-top:5px;
        }
        /*增删改按钮*/
        table.zxtreetable td a,table.zxtreetable td input[type='button']{
            display: inline-block;
            background: #ff9600;
            color: #fff;
            padding: 3px 8px;
            margin: 0 2px;
            border-radius: 3px;
            text-decoration: none;
            font-size:12px;
        }        
        /*自动换行*/
        table.zxtreetable th,table.zxtreetable td{
            word-break:break-all;
            word-wrap:break-word;
        }
        /*选中效果*/
        table.zxtreetable .selected td {
            background-color: #ffeee2;
        }        
        </style>`;
        $('body').append(style);
    },
    // 【绑定事件】收缩、展开效果
    bind_event_collapse: function() {
        var control_icon = this.container.find("tbody i.control_i");
        var _this = this;
        // 思路：根据每个tr的pid来判定是否选中
        control_icon.click(function(event) {
            var data_id = $(this).parents("tr").attr("data_id");
            var tr_sons = _this.container.find("[data_parentid='" + data_id + "']");
            var flag = $(this).hasClass('fa-chevron-down');
            if (flag) {
                $(this).removeClass('fa-chevron-down');
                $(this).addClass('fa-chevron-right');
                hide_tr(tr_sons);
            } else {
                $(this).addClass('fa-chevron-down');
                $(this).removeClass('fa-chevron-right');
                tr_sons.show();
            }
            return false;
        });

        function hide_tr(trs) {
            trs.hide();
            trs.find('i.control_i').removeClass('fa-chevron-down').addClass('fa-chevron-right');
            trs.each(function(index, tr) {
                if ($(tr).hasClass('has_son')) {
                    var son = _this.container.find("[data_parentid='" + $(tr).attr("data_id") + "']");
                    hide_tr(son);
                }
            });
        }
    },
    // 【绑定事件】单选、多选效果
    bind_event_select: function() {
        var btn = this.container.find('.zxtreetable input[name="x-input-checkbox-all"]');
        var btns = this.container.find('.zxtreetable input[name="x-input-checkbox"]');

        $.initCheckboxSelectAll(btn, btns);
    },

    /*
     * 
     *  --------- 3 辅助 ---------
     *  
     *  
     *  
     *   fn_processNull()：处理空数据
     *  
     *  
     *  
     *  ------------------------------ 
     *      
     */

    // 处理空数据
    fn_processNull: function(originalTxt, replacingTxt) {
        if (replacingTxt === undefined || replacingTxt === null) {
            replacingTxt = "";
        }
        if (originalTxt === undefined || originalTxt === null || $.trim(originalTxt).length == 0 || originalTxt == "null") {
            originalTxt = replacingTxt;
        }
        return originalTxt;
    },

    // 
    // 修正constructor指向
    constructor: zxTreetable

};