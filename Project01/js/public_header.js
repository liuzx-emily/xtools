$(function() {
    $("#topbar_userbox").hover(function() {
        $(".topbar_dropdown_ul").show();
    }, function() {
        $(".topbar_dropdown_ul").hide();
    });
})