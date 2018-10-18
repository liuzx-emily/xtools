var xTable;
$(function() {
    initPositionSelect();
    // laydate
    laydate.render({
        elem: '#inspectTime1',
        max: 0
    });
    laydate.render({
        elem: '#inspectTime2',
        max: 0,
        // 默认值为当天
        value: new Date()
    });
    // select2单选
    $('#select2_danxuan').select2({
        // width: "390px",
        // 选择后是否关闭下拉框
        closeOnSelect: true
    });
    // select2多选
    $('#select2_duoxuan').select2({
        // width: "390px",
        // 选择后是否关闭下拉框
        closeOnSelect: false
    });
    initTable();
});

// 初始化表格
function initTable() {
    var param = {
        id: "zxTable",
        url: BASE_PATH + "data/list.json",
        title: [{
            name: "名称",
            key: "name",
            sort: true
        }, {
            name: "位置",
            key: "position",
            processNull: "暂无",
            sort: true
        }, {
            name: "单位",
            key: "danwei",
            sort: true
        }, {
            name: "人员",
            key: "renyuan",
            sort: true
        }, {
            name: "时间",
            key: "time",
            sort: true,
            formatter: function(value, data) {
                return $.formatDate(value);
            }
        }, {
            name: "结果",
            key: "result",
            sort: true
        }, {
            name: '操作',
            crud: true, // 操作列的crud项必须置为true
            formatter: function(data) {
                var id = data.id;
                return `
                <button class='blue' onclick='detail("${id}")'>详情</button>
                <button class='orange' onclick='detail("${id}")'>编辑</button>
                <button class='red' onclick='fn_delete("${id}")'>删除</button>
                `;
            }
        }],
        // 搜索条件
        searchTerms: {
            sender_id: "A5X1A"
        },
        auto_index: {
            show: true
        },
        // 开启后端排序
        sort: 'back'
    };
    xTable = new zxTable(param);
}

// 搜索
function search() {
    var param = {};
    // 取参数：文字
    var proName = $("#proName").val();
    if ($.checkNull(proName)) {
        param.proName = proName;
    }
    // 取参数：普通select三级联动
    var proPosition = ($("#select_qu").val() || "") + ($("#select_jiezhen").val() || "") + ($("#select_cun").val() || "");
    if ($.checkNull(proPosition)) {
        param.proPosition = proPosition;
    }
    // 取参数：时间，转为时间戳
    var startTime = $("#inspectTime1").val();
    if ($.checkNull(startTime)) {
        param.startTime = new Date(startTime + " 0:00:00").getTime();
    } else {
        param.startTime = 0;
    }
    var endTime = $("#inspectTime2").val();
    if ($.checkNull(endTime)) {
        param.endTime = new Date(endTime + " 23:59:59").getTime();
    } else {
        param.endTime = new Date().getTime();
    }
    if (param.startTime > param.endTime) {
        layer.msg("巡查起始日期不能大于结束日期", {
            icon: 2
        });
        return;
    }
    // 取参数：单选
    var normal_radio = $("[name='normal_radio']:checked").val();
    if ($.checkNull(normal_radio)) {
        param.normal_radio = normal_radio;
    }
    // 取参数：select2单选
    var select2_danxuan = $("#select2_danxuan").val();
    if ($.checkNull(select2_danxuan)) {
        param.select2_danxuan = select2_danxuan;
    }
    // 取参数：select2多选（返回值是null或者数组 ["1"] ["2","3"]）
    var select2_duoxuan = $("#select2_duoxuan").val();
    if ($.checkNull(select2_duoxuan)) {
        param.select2_duoxuan = select2_duoxuan.join("-");
    }
    console.log(param);
    xTable.refresh(param);
}

// 删除
function fn_delete(id) {
    layer.confirm("<i class='fa fa-warning fa-2x' style='color:#FF5722;vertical-align:middle;margin-right:5px'></i>删除后不可恢复，您确认要删除吗？", { title: false }, function(index) {
        // 调用ajax删除
        layer.load();
        console.log("删除", id);
        // 在ajax的success回调中，刷新表格
        xTable.refresh();
        layer.close(index);
    });
}