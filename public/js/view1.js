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

// 定义一个初始化 viewer 的函数
function initializeViewer() {
    return new Promise((resolve, reject) => {
        // 初始化 viewer
        Autodesk.Viewing.Initializer(options, function() {
            // 启动 viewer 并解析 Promise
            viewer.start(options.document, options, function() {
                // 添加选中事件监听器
                // viewer.addEventListener(Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, function(event) {
                //     var dbIds = event.selections[0].dbIdArray; // Array of dbIds
                //     console.log(dbIds); // Print out the dbIds in the console
                // });
                resolve();
            });
        });
    });
}

// 定义一个启动 viewer 的异步函数
async function startViewer() {
    // 等待 viewer 初始化完成
    await initializeViewer();
    // 加载 TransformationExtension
    await viewer.loadExtension('TransformationExtension');
    // 加载 SceneBuilder 扩展
    const ext = await viewer.loadExtension('Autodesk.Viewing.SceneBuilder');
    
    // 添加一个新模型
    ext.addNewModel({
        conserveMemory: false,
        modelNameOverride: 'MyModelName',
    }).then(function(modelBuilder) {
        // 创建一个红色材质
        const red = new THREE.MeshPhongMaterial({
            color: new THREE.Color(1, 0, 0)
        });

        // 创建一个环形几何体
        const torus = new THREE.BufferGeometry().fromGeometry(new THREE.TorusGeometry(10, 2, 32, 32));
        
        // 创建一个变换矩阵
        const transform = new THREE.Matrix4().compose(
            new THREE.Vector3(19, 0, 0),
            new THREE.Quaternion(0, 0, 0, 1),
            new THREE.Vector3(1, 1, 1)
        );
        
        // 向模型中添加片段
        modelBuilder.addFragment(torus, red, transform);
    });
}

// 调用 startViewer 函数启动 viewer
startViewer();
