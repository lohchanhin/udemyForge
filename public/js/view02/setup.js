async function initializeViewer(options, myViewerDiv,panelValues,modelPositions) {
    return new Promise((resolve) => {
      Autodesk.Viewing.Initializer(options, function () {
        let viewer = new Autodesk.Viewing.Private.GuiViewer3D(myViewerDiv);
        viewer.start(options.document, options, function () {
          resolve(viewer);  // 回傳viewer

          viewer.addEventListener(
            Autodesk.Viewing.SELECTION_CHANGED_EVENT,
            async (event) => {
              初始化event(event,panelValues,modelPositions);

              viewer.getProperties(await viewer.getSelection(), data => {
                targetExternalId = data.externalId;
                console.log("Target ExternalId: ", targetExternalId);
            });
            
            }
          );
        });       
      });
    });
  }
  
 function 更新位置(model,selectedDbIds,fragId,panelValues,modelPositions){
     //設定xyz變數
     let x,y,z;

     // 取得世界位置
     let worldPosition;

     //查看是否存儲過
     console.log(panelValues)
     if(panelValues[selectedDbIds]){
         ({x,y,z} = panelValues[selectedDbIds]);
         worldPosition = panelValues[selectedDbIds];
     }else{
         // 获取或设置模型的世界位置
          worldPosition = modelPositions[selectedDbIds[0]];
         if (!worldPosition) {
             //片段代理器
             const fragProxy = viewer.impl.getFragmentProxy(model, fragId);

             //更新位置
             fragProxy.updateAnimTransform();

             //處理世界坐標
             const worldMatrix = new THREE.Matrix4();
             fragProxy.getWorldMatrix(worldMatrix);
             worldPosition = new THREE.Vector3();
             worldPosition.setFromMatrixPosition(worldMatrix);
            // 將片段代理儲存到_selectedFragProxyMap
            // _selectedFragProxyMap[fragId] = fragProxy;

            // 在_modifiedFragIdMap中為此片段ID創建一個新的對象
            // _modifiedFragIdMap[fragId] = {};

             //modelPositions[selectedDbIds[0]] = worldPosition; // 保存世界位置

             //變數更新
             x = worldPosition.x.toFixed(2)
             y = worldPosition.y.toFixed(2)
             z = worldPosition.z.toFixed(2)
         }
     }

     //設定面板數值
     document.getElementById('x').value = x;
     document.getElementById('y').value = y;
     document.getElementById('z').value = z;

     //設定當數值更動
     document.getElementById('x').addEventListener('input', updatePosition);
     document.getElementById('y').addEventListener('input', updatePosition);
     document.getElementById('z').addEventListener('input', updatePosition);
}

 function 取得dbid(event){
    const selectedDbIds = event.dbIdArray;
    document.getElementById('dbid-input').value = selectedDbIds[0];
    return selectedDbIds;
}

 function 初始化event(event,panelValues,modelPositions) {
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
  
      
      更新位置(model, id, fragIds[0],panelValues,modelPositions);
      
     
    }
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