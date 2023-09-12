// 创建一个全局的 viewer 变量
var viewer = null;

// 引入 THREE.js 库
const THREE = window.THREE;

// 从 DOM 中获取用于承载 viewer 的元素
var myViewerDiv = document.getElementById('MyViewerDiv');

// 创建一个新的 viewer 实例
viewer = new Autodesk.Viewing.Private.GuiViewer3D(myViewerDiv);

// 配置 Autodesk viewer 的选项
var options = {
    'env' : 'Local',
    'document':'../bimac/3D View/3d/3d.svf'
};

// 获取 URL 参数
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(window.location.href);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

// 定义一个初始化 viewer 的函数
function initializeViewer() {
    return new Promise((resolve, reject) => {
        // 初始化 viewer
        Autodesk.Viewing.Initializer(options, function() {
            // 启动 viewer 并解析 Promise
            viewer.start(options.document, options, resolve);
        });
    });
}

// 定义一个启动 viewer 的异步函数
async function startViewer() {
    // 等待 viewer 初始化完成
    await initializeViewer();
    
    // 获取 uid 参数
    const uid = getUrlParameter('uid');
    console.log(uid)
    if (uid) {
        // 将 uid 转为整数
        const dbId = parseInt(uid);

        // 添加模型加载完成的事件监听器
        viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, function() {
            // 在一定的延迟后选择和定位到指定的 DBID
            setTimeout(function() {
                viewer.select(dbId);
                viewer.fitToView([dbId]);
            }, 5000);
        });
    }
}

// 调用 startViewer 函数启动 viewer
startViewer();
