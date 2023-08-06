// 创建全局的 viewer 变量
var viewer = null;

// 从 DOM 中获取用于承载 viewer 的元素
var myViewerDiv = document.getElementById('MyViewerDiv');

// 配置 Autodesk viewer 的选项
var options = {
    'env' : 'Local',
    'document':'../bimac/3D View/3d/3d.svf'
};

var _modifiedFragIdMap ={};
let modelPositions = {}; // 用于存储每个模型的世界位置
let panelValues = {}; 

// 定义一个初始化 viewer 的函数
async function initializeViewer() {
    return new Promise((resolve, reject) => {
        Autodesk.Viewing.Initializer(options, function() {
            viewer = new Autodesk.Viewing.Private.GuiViewer3D(myViewerDiv);
            viewer.start(options.document, options, function() {
                // Viewer 初始化成功后注册事件
                viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, async (event) => {
                    const selectedDbIds = event.dbIdArray;
                    document.getElementById('dbid-input').value = selectedDbIds[0];

                    if (selectedDbIds.length > 0) {
                        const model = viewer.model;
                        // Get fragment ID
                        const fragId = await new Promise((resolve) => {
                            viewer.model.getData().instanceTree.enumNodeFragments(selectedDbIds[0], function (fragId) {
                                resolve(fragId);
                            });
                        });
                        _modifiedFragIdMap[fragId] = selectedDbIds[0]; // Store the fragment ID
                        
                        let x,y,z;
                        if(panelValues[selectedDbIds]){
                            ({x,y,z} = panelValues[selectedDbIds]);
                        }else{
                            // 获取或设置模型的世界位置
                            let worldPosition = modelPositions[selectedDbIds[0]];
                            if (!worldPosition) {
                                const fragProxy = viewer.impl.getFragmentProxy(model, fragId);
                                fragProxy.updateAnimTransform();
                                const worldMatrix = new THREE.Matrix4();
                                fragProxy.getWorldMatrix(worldMatrix);
                                worldPosition = new THREE.Vector3();
                                worldPosition.setFromMatrixPosition(worldMatrix);
                                //modelPositions[selectedDbIds[0]] = worldPosition; // 保存世界位置
                                x = worldPosition.x.toFixed(2)
                                y = worldPosition.y.toFixed(2)
                                z = worldPosition.z.toFixed(2)
                            }
                        }
                        // Set the values to the input fields
                        document.getElementById('x').value = x;
                        document.getElementById('y').value = y;
                        document.getElementById('z').value = z;
                        
                        document.getElementById('x').addEventListener('input', updatePosition);
                        document.getElementById('y').addEventListener('input', updatePosition);
                        document.getElementById('z').addEventListener('input', updatePosition);
                    }
                });                
                resolve();
            });
        });
    });
}

function updatePosition() {
    const selectedDbIds = viewer.getSelection()[0];
    if (selectedDbIds != null) {
        // Target world position from the labels
        const targetWorldX = parseFloat(document.getElementById('x').value);
        const targetWorldY = parseFloat(document.getElementById('y').value);
        const targetWorldZ = parseFloat(document.getElementById('z').value);
        const targetWorldPosition = new THREE.Vector3(targetWorldX, targetWorldY, targetWorldZ);

        viewer.model.getData().instanceTree.enumNodeFragments(selectedDbIds, function (fragId) {
            const fragProxy = viewer.impl.getFragmentProxy(viewer.model, fragId);
            fragProxy.getAnimTransform();
            
            // Get current world matrix
            const worldMatrix = new THREE.Matrix4();
            fragProxy.getWorldMatrix(worldMatrix);

            // Extract current world position
            const currentWorldPosition = new THREE.Vector3();
            currentWorldPosition.setFromMatrixPosition(worldMatrix);

            // Compute the difference between target and current world positions
            const translation = targetWorldPosition.clone().sub(currentWorldPosition);
            
            // Apply the world space translation directly to the fragment proxy
            console.log(fragProxy.position)
            fragProxy.position.add(translation);
            console.log(fragProxy.position)
            fragProxy.updateAnimTransform();
                // 保存新的世界位置
            modelPositions[selectedDbIds] = targetWorldPosition.clone();
            // 保存面板值
            panelValues[selectedDbIds] = {
                x: document.getElementById('x').value,
                y: document.getElementById('y').value,
                z: document.getElementById('z').value,
            };
        });
        viewer.impl.sceneUpdated(true);        
    }
}




// 定义一个加载插件的函数
let icons = [];
async function loadExtensions() {
    await viewer.loadExtension('TransformationExtension');
    await viewer.loadExtension('IconMarkupExtension', {
        button: {
            icon: 'fa-thumb-tack',
            tooltip: '顯示標記'
        },
        icons: icons,
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


// 標籤新增
document.getElementById('add-icon-button').addEventListener('click', function() {
    // 讀取輸入的 dbid 和標記內容
    const dbid = document.getElementById('dbid-input').value;
    const label = document.getElementById('markup-content-input').value;

    // 檢查 icons 陣列是否已經包含該 dbid，如果有，則進行更新
    let existingIcon = icons.find(icon => icon.dbId === parseInt(dbid));
    if (existingIcon) {
        existingIcon.label = label;
    } else {
        // 將新的 icon 添加到 icons 陣列
        icons.push({ dbId: parseInt(dbid), label: label, css: 'fas fa-thumb-tack' });
    }

    // 載入插件
    loadExtensions();
});

//SceneBuilder全局變數
let selectedMesh;
let modelBuilder;
let sceneBuilder;
let MeshDictionary = {};

let generatedNumbers = new Set();

function generateUniqueDbId() {
    const min = 10000; // 最小值，5位數的最小值
    const max = 99999; // 最大值，5位數的最大值
    let num;
    do {
        num = Math.floor(Math.random() * (max - min + 1) + min);
    } while (generatedNumbers.has(num));
    generatedNumbers.add(num);
    return num;
}


//添加模型
const button = document.getElementById('add-geom');
button.addEventListener('click', async function () {        
    sceneBuilder = await viewer.loadExtension('Autodesk.Viewing.SceneBuilder');
    modelBuilder = await sceneBuilder.addNewModel({ conserveMemory: false, modelNameOverride: 'test' }); 
    const dbid = generateUniqueDbId()
    const mesh = addGeometryV1(modelBuilder,dbid);
    MeshDictionary[dbid] = mesh;  // Store the mesh with its dbId
    viewer.addEventListener(Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, async function(ev) {
        const selection = viewer.getAggregateSelection();
        //console.log(selection);
        var dbId = selection[0].selection[0];
        document.getElementById('dbid-input').value = dbId;
        //console.log(modelBuilder);
        selectedMesh = MeshDictionary[dbId]; // Retrieve the mesh by its dbId
        if(selectedMesh!=null){
            console.log(selectedMesh);
            document.getElementById('x').value = selectedMesh.position.x;
            document.getElementById('y').value = selectedMesh.position.y;
            document.getElementById('z').value = selectedMesh.position.z;

            document.getElementById('x').addEventListener('input', updatePosition);
            document.getElementById('y').addEventListener('input', updatePosition);
            document.getElementById('z').addEventListener('input', updatePosition);
        }else{
             // Get fragment ID
             const fragId = await  new Promise((resolve) => {
                viewer.model.getData().instanceTree.enumNodeFragments(dbId, function (fragId) {
                    resolve(fragId);
                });
            });
            console.log(fragId)                         
            // Get world transformation matrix for the fragment
            const fragProxy = viewer.impl.getFragmentProxy(viewer.model, fragId);
            fragProxy.updateAnimTransform();
            const worldMatrix = new THREE.Matrix4();
            fragProxy.getWorldMatrix(worldMatrix);

            // Extract world position from the transformation matrix
            const worldPosition = new THREE.Vector3();
            worldPosition.setFromMatrixPosition(worldMatrix);

            // Set the values to the input fields
            document.getElementById('x').value = worldPosition.x.toFixed(2);
            document.getElementById('y').value = worldPosition.y.toFixed(2);
            document.getElementById('z').value = worldPosition.z.toFixed(2);

            document.getElementById('x').addEventListener('input', updatePosition2(dbId));
            document.getElementById('y').addEventListener('input', updatePosition2(dbId));
            document.getElementById('z').addEventListener('input', updatePosition2(dbId));
        }
        

        function updatePosition() {
            if (selectedMesh) {
                const x = parseFloat(document.getElementById('x').value);
                const y = parseFloat(document.getElementById('y').value);
                const z = parseFloat(document.getElementById('z').value);
                var position = new THREE.Vector3(x,y,z)
                selectedMesh.matrix.setPosition(position);
                selectedMesh.position.x = x
                console.log(selectedMesh.position.x)
                modelBuilder.updateMesh(selectedMesh);
                console.log(selectedMesh.position)
            }
        }

        function updatePosition2(dbId) {
            if (modelPositions[dbId]) {
                // 如果已經移動過，使用字典中的位置
                const { x, y, z } = modelPositions[dbId];
                document.getElementById('x').value = x;
                document.getElementById('y').value = y;
                document.getElementById('z').value = z;
            } else if (dbId != null) {
                // 如果尚未移動，計算位置並存儲在字典中
                viewer.model.getData().instanceTree.enumNodeFragments(dbId, function (fragId) {
                    const fragProxy = viewer.impl.getFragmentProxy(viewer.model, fragId);
                    console.log(fragProxy)
                    fragProxy.getAnimTransform();
                    const worldMatrix = new THREE.Matrix4();
                    fragProxy.getWorldMatrix(worldMatrix);
                    const worldPosition = new THREE.Vector3();
                    worldPosition.setFromMatrixPosition(worldMatrix);
                    
                    // 將位置存儲在字典中
                    modelPositions[dbId] = {
                        x: worldPosition.x.toFixed(2),
                        y: worldPosition.y.toFixed(2),
                        z: worldPosition.z.toFixed(2),
                    };
        
                    document.getElementById('x').value = worldPosition.x.toFixed(2);
                    document.getElementById('y').value = worldPosition.y.toFixed(2);
                    document.getElementById('z').value = worldPosition.z.toFixed(2);
                });
            }
        }
    });
});







