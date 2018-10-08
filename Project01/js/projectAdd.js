$(function() {
    init()
});

function init() {
    // 折叠展开
    $(".projectinfo_box_togglebtn").click(function() {
        if ($(this).children("i").attr('class') == "fa fa-angle-double-up") {
            $(this).parents(".tab_zu").siblings(".table_con").hide();
            $(this).children("i").removeClass("fa fa-angle-double-up").addClass("fa fa-angle-double-down");
            $(this).children("span").text("展开");
        } else {
            $(this).parents(".tab_zu").siblings(".table_con").show();
            $(this).children("i").removeClass("fa fa-angle-double-down").addClass("fa fa-angle-double-up");
            $(this).children("span").text("折叠");
        }
    });

}