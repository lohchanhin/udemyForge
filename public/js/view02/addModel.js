//亂數生成dbid
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

//Three Mesh方式
function addGeometryV1(modelBuilder, dbId) {
  const boxGeometry = new THREE.BufferGeometry().fromGeometry(new THREE.BoxGeometry(10, 10, 10));
  const boxMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color(1, 0, 0) });
  const Mesh = new THREE.Mesh(boxGeometry, boxMaterial);
  const x = parseFloat(document.getElementById('x').value);
  const y = parseFloat(document.getElementById('y').value);
  const z = parseFloat(document.getElementById('z').value);
  var position = new THREE.Vector3(x,y,z)
  Mesh.matrix = new THREE.Matrix4().compose(
    position,
    new THREE.Quaternion(0, 0, 0, 1),
    new THREE.Vector3(1, 1, 1)
  );
  Mesh.dbId = dbId;
  modelBuilder.addMesh(Mesh);
  Mesh.position.set(x,y,z);
  Mesh.updateMatrix();
  modelBuilder.updateMesh(Mesh)
  return Mesh;
}

async function LoadSceneBuilder(){
    //載入外掛
    sceneBuilder = await viewer.loadExtension("Autodesk.Viewing.SceneBuilder");
    modelBuilder = await sceneBuilder.addNewModel({
      conserveMemory: false,
      modelNameOverride: "test",
    });
    
    //生成dbid
    const dbid = generateUniqueDbId();
  
    //生成模型
    const mesh = addGeometryV1(modelBuilder, dbid);
  
    //保存進額外模型字典
    MeshDictionary[dbid] = mesh;
  
    //當聚合模型被選擇切換
    viewer.addEventListener(
      Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
      async function (ev) {
        //取得選擇資訊
        const selection = viewer.getAggregateSelection();
  
        //取得dbid
        var dbId = selection[0].selection[0];
        document.getElementById("dbid-input").value = dbId;
  
        //檢查選擇的模型是額外添加的還是原本就有
        selectedMesh = MeshDictionary[dbId];
  
        console.log(selectedMesh);
  
        //當選擇的是額外添加模型
        if (selectedMesh != null) {
          // console.log(selectedMesh);
  
          //載入數值即可
          document.getElementById("x").value = selectedMesh.position.x;
          document.getElementById("y").value = selectedMesh.position.y;
          document.getElementById("z").value = selectedMesh.position.z;
  
          //聚合模型額外添加模型更換位置
          document.getElementById("x").addEventListener("input", updatePosition);
          document.getElementById("y").addEventListener("input", updatePosition);
          document.getElementById("z").addEventListener("input", updatePosition);
        } else {
          //當選擇的是聚合模型的預設模型
          //取得fragId
          const fragId = await new Promise((resolve) => {
            viewer.model
              .getData()
              .instanceTree.enumNodeFragments(dbId, function (fragId) {
                resolve(fragId);
              });
          });
          // console.log(fragId)
  
          //取得片段代理
          const fragProxy = viewer.impl.getFragmentProxy(viewer.model, fragId);
          fragProxy.updateAnimTransform(); //更新動畫變換
          const worldMatrix = new THREE.Matrix4();
          fragProxy.getWorldMatrix(worldMatrix); //取得世界變換矩陣
  
          //從變換矩陣取得世界位置
          const worldPosition = new THREE.Vector3();
          worldPosition.setFromMatrixPosition(worldMatrix);
  
          //設定面板數值
          document.getElementById("x").value = worldPosition.x.toFixed(2);
          document.getElementById("y").value = worldPosition.y.toFixed(2);
          document.getElementById("z").value = worldPosition.z.toFixed(2);
  
          //數值改動添加updatePosition2
          document
            .getElementById("x")
            .addEventListener("input", updatePosition2(dbId));
          document
            .getElementById("y")
            .addEventListener("input", updatePosition2(dbId));
          document
            .getElementById("z")
            .addEventListener("input", updatePosition2(dbId));
        }
  
        function updatePosition() {
          if (selectedMesh) {
            // 從面板讀取相對坐標
            const targetX = parseFloat(document.getElementById("x").value);
            const targetY = parseFloat(document.getElementById("y").value);
            const targetZ = parseFloat(document.getElementById("z").value);
  
            // 將新的本地坐標設置到模型
            selectedMesh.position.set(targetX, targetY, targetZ);
  
            // 標記矩陣需要更新
            selectedMesh.matrixAutoUpdate = true;
            selectedMesh.updateMatrix();
  
            // 如果有額外的更新，應用它們
            modelBuilder.updateMesh(selectedMesh);
          }
        }
  
        function updatePosition2(dbId) {
          if (modelPositions[dbId]) {
            // 如果已經移動過，使用字典中的位置
            const { x, y, z } = modelPositions[dbId];
            document.getElementById("x").value = x;
            document.getElementById("y").value = y;
            document.getElementById("z").value = z;
          } else if (dbId != null) {
            // 如果尚未移動，計算位置並存儲在字典中
            viewer.model
              .getData()
              .instanceTree.enumNodeFragments(dbId, function (fragId) {
                const fragProxy = viewer.impl.getFragmentProxy(
                  viewer.model,
                  fragId
                );
                console.log(fragProxy);
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
  
                document.getElementById("x").value = worldPosition.x.toFixed(2);
                document.getElementById("y").value = worldPosition.y.toFixed(2);
                document.getElementById("z").value = worldPosition.z.toFixed(2);
              });
          }
        }
      }
    );
}