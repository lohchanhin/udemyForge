// 创建全局的 viewer 变量
var viewer = null;

// 从 DOM 中获取用于承载 viewer 的元素
var myViewerDiv = document.getElementById('MyViewerDiv');

// 配置 Autodesk viewer 的选项
var options = {
    'env' : 'Local',
    'document':'../bimac/3D View/3d/3d.svf'
};

// 定义一个初始化 viewer 的函数
async function initializeViewer() {
    return new Promise((resolve, reject) => {
        Autodesk.Viewing.Initializer(options, function() {
            viewer = new Autodesk.Viewing.Private.GuiViewer3D(myViewerDiv);
            viewer.start(options.document, options, function() {
                // Viewer 初始化成功后注册事件
                viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, (event) => {
                    const selectedDbIds = event.dbIdArray;
                    console.log(event);
                    if (selectedDbIds.length > 0) {
                        viewer.getProperties(selectedDbIds[0], (props) => {
                            console.log('Selected object properties:', props);
                        });
                    }
                });
                resolve();
            });
        });
    });
}


// 定义一个加载插件的函数
async function loadExtensions() {
    await viewer.loadExtension('TransformationExtension');
    await viewer.loadExtension('IconMarkupExtension', {
        button: {
            icon: 'fa-thermometer-half',
            tooltip: '顯示標記'
        },
        icons: [
            { dbId: 12149,   label: '標記內容', css: 'fas fa-thermometer-full' },
            
        ],
        onClick: (id) => {
            viewers.select(id);
            viewers.utilities.fitToView();
            switch (id){
                case 563:
                    alert('Sensor offline');
            }
        }
    })
}



// 启动 viewer
async function startViewer() {
    await initializeViewer();
    await loadExtensions();    
}




// 调用 startViewer 函数启动 viewer
startViewer();

async function Reset() {
    await viewer.unloadExtension('TransformationExtension');
    await viewer.loadExtension('TransformationExtension');
}



// const button = document.getElementById('add-geom');
// console.log(button);
// button.addEventListener('click', async function () {
//     console.log("添加模型");
//     const sceneBuilder = await viewer.loadExtension('Autodesk.Viewing.SceneBuilder');
//     console.log(sceneBuilder);
//     const modelBuilder = await sceneBuilder.addNewModel({ conserveMemory: false, modelNameOverride: 'My Custom Model' }); 
//     addGeometryV1(modelBuilder, 123456);
    
// });