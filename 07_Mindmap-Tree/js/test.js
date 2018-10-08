/**
 * Created by rockyren on 14/11/23.
 * edited by x on 2018/07/18
 */

var zxMindMap = {
    // 初始化函数：容器id，数据处理函数，节点的点击事件函数
    init: function(containerId, processDataFn, clickFn) {
        require.config({
            paths: {
                'raphael': 'packages/bower/raphael/raphael',
                'jquery': 'packages/bower/jquery/dist/jquery',
                'bootstrap': '../bootstrap/js/bootstrap.min'
            },
            shim: {
                'bootstrap': {
                    deps: ['jquery'],
                    exports: 'bootstrap'
                }
            }
        });
        require(['imp/Graph', 'imp/Renderer', 'jquery', 'bootstrap', 'raphael'], function(Graph, Renderer, $) {
            // 因为引入了他自己的Jquery，所以在xTools中添加的方法需要重新添加
            $.extend(xTools.jQuery_addOns);
            // 添加点击事件
            if (clickFn) {
                Renderer.prototype.setCanvasClick = function(graph) {
                    var selfRen = this;
                    this.canvasDom.addEventListener('mousedown', function(event) {
                        if (event.target.nodeName === 'svg') {
                            // 点击画布
                            graph.setSelected(null);
                            selfRen.toolbar.setAllUnactive();
                            $('#label-group input').val('');
                        } else {
                            // 点击节点
                            clickFn(graph.selected, graph);
                        }
                    });

                };
            }
            var renderer = new Renderer({
                canvasId: containerId
            });
            // 处理数据
            processDataFn(new Graph(renderer));
        });
    },
    // 设置根节点
    setRoot: function(graph, name, data) {
        graph.setRoot({
            label: name || "根节点",
            data: data || {}
        });
    },
    // 循环函数
    cycle: function(graph, dataArr, parentNode) {
        if (dataArr && dataArr.length > 0) {
            $.each(dataArr, function(index, data) {
                var newNode = graph.addNode(parentNode, {
                    label: data.name,
                    data: data
                });
                zxMindMap.cycle(graph, data.children, newNode);
            });
        }
    }
};
/* ---------------------------上面的内容一般不需要变--------------------- */
/* ---------------------------- 修改下面的内容即可 ---------------------- */
// 说明：因为需要等待main.js加载完成，so所有相关的操作只能写在main.js中
$(function() {
    // 加载数据，初始化脑图
    initMindMap();
});
// 分类 思维导图
function initMindMap() {
    var dataArr = [{
        name: "大陆",
        children: [{
            name: "亚洲",
            children: [{ name: "中国" }, { name: "日本" }]
        }, {
            name: "非洲洲",
            children: []
        }]
    }, {
        name: "海洋",
        children: [{
            name: "太平洋",
            children: []
        }, {
            name: "北冰洋",
            children: []
        }]
    }];

    /*  使用MindMap:
        1容器id
        2生成数据的函数
        3点击事件
    */
    zxMindMap.init("mindmap_container", function(graph) {
        // 设置根节点
        zxMindMap.setRoot(graph, "分类", { catalogId: -1 });
        // 循环生成数据
        zxMindMap.cycle(graph, dataArr, graph.root);
    }, function(node, graph) {
        // console.log(node);
        // console.log(graph);
        var catalogId = node.data.catalogId;
        if (catalogId && catalogId !== -1) {
            jumptoList(catalogId, 0);
        }
    });



}