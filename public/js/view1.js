// 创建全局的 viewer 变量
var viewer = null;

var floorDbIds = {}; // 全局变量，用于存储每个楼层的 dbIds
var allDbIds = []; // 全局变量，用于存储所有的 dbIds

let modelPositions = {}; // 用于存储每个模型的世界位置
let panelValues = {};

// 从 DOM 中获取用于承载 viewer 的元素
var myViewerDiv = document.getElementById("MyViewerDiv");

// 配置 Autodesk viewer 的选项
var options = {
  env: "Local",
  document: "../bimac/3D View/3d/3d.svf",
};

// //一般處理
// function 取得dbid(event){
//     const selectedDbIds = event.dbIdArray;
//     document.getElementById('dbid-input').value = selectedDbIds[0];
//     return selectedDbIds;
// }

// function 更新位置(model,selectedDbIds,fragId){
//      //設定xyz變數
//      let x,y,z;

//      // 取得世界位置
//      let worldPosition;

//      //查看是否存儲過
//      if(panelValues[selectedDbIds]){
//          ({x,y,z} = panelValues[selectedDbIds]);
//          worldPosition = panelValues[selectedDbIds];
//      }else{
//          // 获取或设置模型的世界位置
//           worldPosition = modelPositions[selectedDbIds[0]];
//          if (!worldPosition) {
//              //片段代理器
//              const fragProxy = viewer.impl.getFragmentProxy(model, fragId);

//              //更新位置
//              fragProxy.updateAnimTransform();

//              //處理世界坐標
//              const worldMatrix = new THREE.Matrix4();
//              fragProxy.getWorldMatrix(worldMatrix);
//              worldPosition = new THREE.Vector3();
//              worldPosition.setFromMatrixPosition(worldMatrix);
//             // 將片段代理儲存到_selectedFragProxyMap
//             // _selectedFragProxyMap[fragId] = fragProxy;

//             // 在_modifiedFragIdMap中為此片段ID創建一個新的對象
//             // _modifiedFragIdMap[fragId] = {};

//              //modelPositions[selectedDbIds[0]] = worldPosition; // 保存世界位置

//              //變數更新
//              x = worldPosition.x.toFixed(2)
//              y = worldPosition.y.toFixed(2)
//              z = worldPosition.z.toFixed(2)
//          }
//      }

//      //設定面板數值
//      document.getElementById('x').value = x;
//      document.getElementById('y').value = y;
//      document.getElementById('z').value = z;

//      //設定當數值更動
//      document.getElementById('x').addEventListener('input', updatePosition);
//      document.getElementById('y').addEventListener('input', updatePosition);
//      document.getElementById('z').addEventListener('input', updatePosition);
// }

async function 取得fragId(dbid) {
  return new Promise((resolve) => {
    viewer.model
      .getData()
      .instanceTree.enumNodeFragments(dbid[0], function (fragId) {
        resolve(fragId);
      });
  });
}
//一般處理

//移動工具管理

// // // //拖拉工具全局變數
// // var _hitPoint = null;
// // var _isDragging = false;
// // var _transformMesh = null;
// // var _modifiedFragIdMap = {};
// // var _selectedFragProxyMap = {};
// // var _transformControlTx = null;
// // var centerPoint = nullter

// function 生成xyz軸線() {
//     console.log("生成xyz軸線函數被調用");
//     viewer.impl.createOverlayScene('Dotty.Viewing.Tool.TransformTool');
//     _transformControlTx = new THREE.TransformControls(
//         viewer.impl.camera,
//         viewer.impl.canvas,
//         "translate"
//     );
//     var bbox = viewer.model.getBoundingBox();
//     _transformControlTx.setSize(bbox.getBoundingSphere().radius * 5);
//     console.log("TransformControls大小設置為:", bbox.getBoundingSphere().radius * 5);
//     _transformControlTx.visible = false;
//     viewer.impl.addOverlay('Dotty.Viewing.Tool.TransformTool', _transformControlTx);
//     console.log("TransformControls已添加到視圖");
//     _transformMesh = createTransformMesh();
//     _transformControlTx.attach(_transformMesh);
//     console.log("TransformMesh已創建並附加到TransformControls");
// }

// function createTransformMesh() {
//     console.log("createTransformMesh函數被調用");

//     var material = new THREE.MeshPhongMaterial(
//         { color: 0xff0000 });

//     var materialGuid = guid();
//     viewer.impl.matman().addMaterial(
//         materialGuid,
//         material,
//         true);
//     console.log("材料已添加，GUID:", materialGuid);

//     var sphere = new THREE.Mesh(
//         new THREE.SphereGeometry(0.0001, 5),
//         material);

//     sphere.position.set(0, 0, 0);
//     sphere.addEventListener('click',function(event){
//         console.log("測試");
//     })
//     console.log("球體創建完成，位置設置為(0,0,0)");

//     return sphere;
// }

// function 判斷xyz軸線位置(centerPoint) {
//     if (_hitPoint) {
//         _transformControlTx.visible = true;
//         _transformControlTx.setPosition(centerPoint);
//         _transformControlTx.addEventListener('change', onTxChange);
//         viewer.addEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, onCameraChanged);
//     }
// }

// function 判斷是否關閉(condition) {
//     if (condition) {
//         _transformControlTx.visible = false;
//     }
// }

// function normalize(screenPoint) {
//     var viewport = viewer.navigation.getScreenViewport();

//     var n = {
//         x: (screenPoint.x - viewport.left) / viewport.width,
//         y: (screenPoint.y - viewport.top) / viewport.height
//     };

//     return n;
// }

// function getHitPoint(event) {
//     var screenPoint = {
//         x: event.clientX,
//         y: event.clientY
//     };

//     var n = normalize(screenPoint);

//     var hitPoint = viewer.utilities.getHitPoint(n.x, n.y);

//     return hitPoint;
// }

// function handleMouseMove(event) {
//     console.log('滑鼠移動')

//     if (_isDragging) {
//         if (_transformControlTx.onPointerMove(event)) {
//             return true;
//         }
//         return false;
//     }

//     if (_transformControlTx.onPointerHover(event))
//         return true;

//     return false;
// }

// function handleButtonDown(event, button) {
//     console.log('按下')

//     _hitPoint = getHitPoint(event);
//     _isDragging = true;

//     if (_transformControlTx.onPointerDown(event))
//         return true;

//     return false;
// }

// function handleButtonUp(event, button) {
//     console.log('放開')
//     _isDragging = false;

//     if (_transformControlTx.onPointerUp(event))
//         return true;

//     return false;
// }

// function onTxChange() {
//     for (var fragId in _selectedFragProxyMap) {
//         var fragProxy = _selectedFragProxyMap[fragId];

//         var position = new THREE.Vector3(
//             _transformMesh.position.x - fragProxy.offset.x,
//             _transformMesh.position.y - fragProxy.offset.y,
//             _transformMesh.position.z - fragProxy.offset.z);

//         fragProxy.position = position;
//         fragProxy.updateAnimTransform();
//     }

//     viewer.impl.sceneUpdated(true);
// }

// function onCameraChanged() {
//     if (_transformControlTx !== null) {
//         _transformControlTx.update();
//         //判斷xyz軸線位置(centerPoint);
//     }
// }

// function guid() {

//     var d = new Date().getTime();

//     var guid = 'xxxx-xxxx-xxxx-xxxx-xxxx'.replace(
//         /[xy]/g,
//         function (c) {
//             var r = (d + Math.random() * 16) % 16 | 0;
//             d = Math.floor(d / 16);
//             return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
//         });

//     return guid;
// };

// 移動工具管理

async function 初始化event(event) {
  var id = 取得dbid(event);
  var model = viewer.model;
  if (id.length > 0) {
    const fragIds = [];
    viewer.model
      .getData()
      .instanceTree.enumNodeFragments(id[0], function (fragId) {
        fragIds.push(fragId);
      });

    const fragBoundingBox = new THREE.Box3();
    fragIds.forEach((fragId) => {
      const singleFragBox = new THREE.Box3();
      viewer.model.getFragmentList().getWorldBounds(fragId, singleFragBox);
      fragBoundingBox.union(singleFragBox);
    });

    centerPoint = fragBoundingBox.getCenter(new THREE.Vector3());

    // if(_transformControlTx == null){
    //      生成xyz軸線();
    //  }
    更新位置(model, id, fragIds[0]);

    // _hitPoint = centerPoint
    //  // 處理按鈕下壓事件以確定_hitPoint
    //  handleButtonDown(event);
    //  //handleMouseMove(event)
    //  //handleButtonUp(event)
    //  if (_hitPoint) {
    //     // 判斷xyz軸線位置
    //     判斷xyz軸線位置(centerPoint);
    // } else {
    //     // 判斷是否關閉
    //     判斷是否關閉(true);
    // }
  }
}

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function getDbIds() {
  console.log("getDbIds called"); // 添加这一行
  await delay(2000); // 等待 2 秒
  console.log(viewer.model.getData());
  var result = Object.keys(
    viewer.model.getData().instanceTree.nodeAccess.dbIdToIndex
  ).map(Number);
  console.log("getDbIds finished, result:", result); // 添加这一行
  allDbIds = result; // 将结果保存到全局变量
  return result;
}

// 全局變數用於保存獨特的屬性名稱
let globalUniqueProperties = new Set();

async function getAllProperties() {
  // 為每個dbId創建一個promise
  let promises = allDbIds.map(async (dbId) => {
    return new Promise((resolve) => {
      viewer.getProperties(dbId, (propertiesData) => {
        propertiesData.properties.forEach((p) => {
          if (!globalUniqueProperties.has(p.displayName)) {
            globalUniqueProperties.add(p.displayName);
          }
        });
        resolve();
      });
      setTimeout(() => {
        resolve();
      }, 5000);
    });
  });

  // 等待所有promises完成
  await Promise.all(promises);

  return globalUniqueProperties;
}

async function searchAndHighlight() {
  const selectedProperty = document.getElementById("propertiesDropdown").value;
  const selectedValue = document.getElementById("valuesDropdown").value;

  console.log(selectedProperty, selectedValue);
  const matchedDbIds = [];

  for (let dbId of allDbIds) {
    console.log("test");
    const properties = await new Promise((resolve) =>
      viewer.getProperties(dbId, resolve)
    );
    console.log("test2");
    for (let prop of properties.properties) {
      console.log(typeof prop.displayName, typeof prop.displayValue);
      if (
        prop.displayName === selectedProperty &&
        prop.displayValue === selectedValue
      ) {
        matchedDbIds.push(dbId);
        break;
      }
    }
  }

  viewer.hideAll(); // 顯示匹配的項目並隱藏其他的
  viewer.select(matchedDbIds); // 選擇匹配的項目
}

// 添加事件監聽器以響應按鈕點擊
document
  .getElementById("searchButton")
  .addEventListener("click", searchAndHighlight);

async function getPropertyValues(propertyName) {
  return new Promise((resolve) => {
    viewer.model.getBulkProperties(
      allDbIds,
      { propFilter: [propertyName] },
      function (props) {
        const uniqueValues = new Set();
        props.forEach((prop) => {
          const property = prop.properties.find(
            (p) => p.displayName === propertyName
          );
          if (property) {
            uniqueValues.add(property.displayValue);
          }
        });
        resolve([...uniqueValues]);
      }
    );
  });
}

async function createButtonsBasedOnPropertyAndValue(propertyName, valueName) {
  const propertyValuesMap = {};

  await viewer.model.getBulkProperties(
    allDbIds,
    { propFilter: [propertyName] },
    function (props) {
      props.forEach((prop) => {
        const property = prop.properties.find(
          (p) => p.displayName === propertyName
        );
        if (property) {
          if (propertyValuesMap[property.displayValue]) {
            propertyValuesMap[property.displayValue].push(prop.dbId);
          } else {
            propertyValuesMap[property.displayValue] = [prop.dbId];
          }
        }
      });
    }
  );

  const floorsDiv = document.getElementById("floors");
  floorsDiv.innerHTML = ""; // Clear existing buttons

  for (const value in propertyValuesMap) {
    if (!valueName || value === valueName) {
      const button = document.createElement("button");
      button.textContent = `${propertyName}: ${value}`;
      button.onclick = () => {
        viewer.hide(allDbIds);
        viewer.show(propertyValuesMap[value]);
      };
      floorsDiv.appendChild(button);
    }
  }
}

const propertiesDropdown = document.getElementById("propertiesDropdown");
const valuesDropdown = document.getElementById("valuesDropdown");

propertiesDropdown.addEventListener("change", function () {
  const selectedProperty = propertiesDropdown.value;
  getPropertyValues(selectedProperty).then((values) => {
    valuesDropdown.innerHTML = ""; // Clear existing options
    values.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.text = value;
      valuesDropdown.add(option);
    });
  });
});

valuesDropdown.addEventListener("change", function () {
  const selectedProperty = propertiesDropdown.value;
  const selectedValue = valuesDropdown.value;
  createButtonsBasedOnPropertyAndValue(selectedProperty, selectedValue);
});

async function initializeViewer() {
  return new Promise((resolve, reject) => {
    Autodesk.Viewing.Initializer(options, function () {
      viewer = new Autodesk.Viewing.Private.GuiViewer3D(myViewerDiv);
      viewer.start(options.document, options, function () {
        viewer.addEventListener(
          Autodesk.Viewing.SELECTION_CHANGED_EVENT,
          async (event) => {
            初始化event(event);
          }
        );
        viewer.addEventListener(
          Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
          async () => {
            console.log("GEOMETRY_LOADED_EVENT triggered");
            allDbIds = await getDbIds();
            var propertiesValue = await getAllProperties();
            console.log(propertiesValue);
            getAllProperties().then((properties) => {
              properties.forEach((property) => {
                const option = document.createElement("option");
                option.value = property;
                option.text = property;
                propertiesDropdown.add(option);
              });
            });
          }
        );
        resolve();
      });
    });
  });
}

//未添加模型時候的更新位置
function updatePosition() {
  const selectedDbIds = viewer.getSelection()[0];
  if (selectedDbIds != null) {
    // 從面板數值讀取世界坐標
    const targetWorldX = parseFloat(document.getElementById("x").value);
    const targetWorldY = parseFloat(document.getElementById("y").value);
    const targetWorldZ = parseFloat(document.getElementById("z").value);
    const targetWorldPosition = new THREE.Vector3(
      targetWorldX,
      targetWorldY,
      targetWorldZ
    );

    //讀取片段位置，用dbid取得fragid然後執行代碼
    viewer.model
      .getData()
      .instanceTree.enumNodeFragments(selectedDbIds, function (fragId) {
        //取得片段代理
        const fragProxy = viewer.impl.getFragmentProxy(viewer.model, fragId);
        //更新位置
        fragProxy.getAnimTransform();

        //取得世界坐標
        const worldMatrix = new THREE.Matrix4();
        fragProxy.getWorldMatrix(worldMatrix);

        //取得現在世界坐標
        const currentWorldPosition = new THREE.Vector3();
        currentWorldPosition.setFromMatrixPosition(worldMatrix);

        //計算目標世界坐標和現在世界坐標的差距
        const translation = targetWorldPosition
          .clone()
          .sub(currentWorldPosition);

        //把差距加進local坐標
        // console.log(fragProxy.position)
        fragProxy.position.add(translation);
        // console.log(fragProxy.position)

        //更新坐標
        fragProxy.updateAnimTransform();
        // 保存新的世界位置
        modelPositions[selectedDbIds] = targetWorldPosition.clone();
        // 保存面板值
        panelValues[selectedDbIds] = {
          x: document.getElementById("x").value,
          y: document.getElementById("y").value,
          z: document.getElementById("z").value,
        };

        // 將片段代理儲存到_selectedFragProxyMap
        // _selectedFragProxyMap[fragId] = fragProxy;

        // // 在_modifiedFragIdMap中為此片段ID創建一個新的對象
        // _modifiedFragIdMap[fragId] = {};
      });
    viewer.impl.sceneUpdated(true);
  }
}

// 定义一个加载插件的函数
// let icons = [];
// // async function loadExtensions() {
// //   await viewer.loadExtension("TransformationExtension");
// //   await viewer.loadExtension("IconMarkupExtension", {
// //     button: {
// //       icon: "fa-thumb-tack",
// //       tooltip: "顯示標記",
// //     },
// //     icons: icons,
// //     onClick: (id) => {
// //       viewers.select(id);
// //       viewers.utilities.fitToView();
// //       switch (id) {
// //         case 563:
// //           alert("Sensor offline");
// //       }
// //     },
// //   });
// }

// // 启动 viewer
// async function startViewer() {
//   await initializeViewer();
//   await loadExtensions();
// }

// // 调用 startViewer 函数启动 viewer
// startViewer();

// // 標籤新增
// document
//   .getElementById("add-icon-button")
//   .addEventListener("click", function () {
//     // 讀取輸入的 dbid 和標記內容
//     const dbid = document.getElementById("dbid-input").value;
//     const label = document.getElementById("markup-content-input").value;

//     // 檢查 icons 陣列是否已經包含該 dbid，如果有，則進行更新
//     let existingIcon = icons.find((icon) => icon.dbId === parseInt(dbid));
//     if (existingIcon) {
//       existingIcon.label = label;
//     } else {
//       // 將新的 icon 添加到 icons 陣列
//       icons.push({
//         dbId: parseInt(dbid),
//         label: label,
//         css: "fas fa-thumb-tack",
//       });
//     }

//     // 載入插件
//     loadExtensions();
//   });

// //SceneBuilder全局變數
// let selectedMesh; //添加額外的模型
// let modelBuilder; //外掛
// let sceneBuilder; //外掛
// let MeshDictionary = {}; //字典

// let generatedNumbers = new Set(); //dbid是否相同

// //亂數生成dbid
// function generateUniqueDbId() {
//   const min = 10000; // 最小值，5位數的最小值
//   const max = 99999; // 最大值，5位數的最大值
//   let num;
//   do {
//     num = Math.floor(Math.random() * (max - min + 1) + min);
//   } while (generatedNumbers.has(num));
//   generatedNumbers.add(num);
//   return num;
// }

// //添加模型
// const button = document.getElementById("add-geom");
// button.addEventListener("click", async function () {
//   //載入外掛
//   sceneBuilder = await viewer.loadExtension("Autodesk.Viewing.SceneBuilder");
//   modelBuilder = await sceneBuilder.addNewModel({
//     conserveMemory: false,
//     modelNameOverride: "test",
//   });

//   //生成dbid
//   const dbid = generateUniqueDbId();

//   //生成模型
//   const mesh = addGeometryV1(modelBuilder, dbid);

//   //保存進額外模型字典
//   MeshDictionary[dbid] = mesh;

//   //當聚合模型被選擇切換
//   viewer.addEventListener(
//     Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
//     async function (ev) {
//       //取得選擇資訊
//       const selection = viewer.getAggregateSelection();

//       //取得dbid
//       var dbId = selection[0].selection[0];
//       document.getElementById("dbid-input").value = dbId;

//       //檢查選擇的模型是額外添加的還是原本就有
//       selectedMesh = MeshDictionary[dbId];

//       console.log(selectedMesh);

//       //當選擇的是額外添加模型
//       if (selectedMesh != null) {
//         // console.log(selectedMesh);

//         //載入數值即可
//         document.getElementById("x").value = selectedMesh.position.x;
//         document.getElementById("y").value = selectedMesh.position.y;
//         document.getElementById("z").value = selectedMesh.position.z;

//         //聚合模型額外添加模型更換位置
//         document.getElementById("x").addEventListener("input", updatePosition);
//         document.getElementById("y").addEventListener("input", updatePosition);
//         document.getElementById("z").addEventListener("input", updatePosition);

//         updateAxesHelper(selectedMesh.position);
//       } else {
//         //當選擇的是聚合模型的預設模型
//         updateAxesHelper(selectedMesh.position);
//         //取得fragId
//         const fragId = await new Promise((resolve) => {
//           viewer.model
//             .getData()
//             .instanceTree.enumNodeFragments(dbId, function (fragId) {
//               resolve(fragId);
//             });
//         });
//         // console.log(fragId)

//         //取得片段代理
//         const fragProxy = viewer.impl.getFragmentProxy(viewer.model, fragId);
//         fragProxy.updateAnimTransform(); //更新動畫變換
//         const worldMatrix = new THREE.Matrix4();
//         fragProxy.getWorldMatrix(worldMatrix); //取得世界變換矩陣

//         //從變換矩陣取得世界位置
//         const worldPosition = new THREE.Vector3();
//         worldPosition.setFromMatrixPosition(worldMatrix);

//         //設定面板數值
//         document.getElementById("x").value = worldPosition.x.toFixed(2);
//         document.getElementById("y").value = worldPosition.y.toFixed(2);
//         document.getElementById("z").value = worldPosition.z.toFixed(2);

//         //數值改動添加updatePosition2
//         document
//           .getElementById("x")
//           .addEventListener("input", updatePosition2(dbId));
//         document
//           .getElementById("y")
//           .addEventListener("input", updatePosition2(dbId));
//         document
//           .getElementById("z")
//           .addEventListener("input", updatePosition2(dbId));
//       }

//       function updatePosition() {
//         if (selectedMesh) {
//           // 從面板讀取相對坐標
//           const targetX = parseFloat(document.getElementById("x").value);
//           const targetY = parseFloat(document.getElementById("y").value);
//           const targetZ = parseFloat(document.getElementById("z").value);

//           // 將新的本地坐標設置到模型
//           selectedMesh.position.set(targetX, targetY, targetZ);

//           // 標記矩陣需要更新
//           selectedMesh.matrixAutoUpdate = true;
//           selectedMesh.updateMatrix();

//           // 如果有額外的更新，應用它們
//           modelBuilder.updateMesh(selectedMesh);
//         }
//       }

//       function updatePosition2(dbId) {
//         if (modelPositions[dbId]) {
//           // 如果已經移動過，使用字典中的位置
//           const { x, y, z } = modelPositions[dbId];
//           document.getElementById("x").value = x;
//           document.getElementById("y").value = y;
//           document.getElementById("z").value = z;
//         } else if (dbId != null) {
//           // 如果尚未移動，計算位置並存儲在字典中
//           viewer.model
//             .getData()
//             .instanceTree.enumNodeFragments(dbId, function (fragId) {
//               const fragProxy = viewer.impl.getFragmentProxy(
//                 viewer.model,
//                 fragId
//               );
//               console.log(fragProxy);
//               fragProxy.getAnimTransform();
//               const worldMatrix = new THREE.Matrix4();
//               fragProxy.getWorldMatrix(worldMatrix);
//               const worldPosition = new THREE.Vector3();
//               worldPosition.setFromMatrixPosition(worldMatrix);

//               // 將位置存儲在字典中
//               modelPositions[dbId] = {
//                 x: worldPosition.x.toFixed(2),
//                 y: worldPosition.y.toFixed(2),
//                 z: worldPosition.z.toFixed(2),
//               };

//               document.getElementById("x").value = worldPosition.x.toFixed(2);
//               document.getElementById("y").value = worldPosition.y.toFixed(2);
//               document.getElementById("z").value = worldPosition.z.toFixed(2);
//             });
//         }
//       }
//     }
//   );
// });
