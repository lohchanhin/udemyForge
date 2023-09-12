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
  const boxGeometry = new THREE.BufferGeometry().fromGeometry(
    new THREE.BoxGeometry(10, 10, 10)
  );
  const boxMaterial = new THREE.MeshPhongMaterial({
    color: new THREE.Color(1, 0, 0),
  });
  const Mesh = new THREE.Mesh(boxGeometry, boxMaterial);
  const x = parseFloat(document.getElementById("x").value);
  const y = parseFloat(document.getElementById("y").value);
  const z = parseFloat(document.getElementById("z").value);
  var position = new THREE.Vector3(x, y, z);
  Mesh.matrix = new THREE.Matrix4().compose(
    position,
    new THREE.Quaternion(0, 0, 0, 1),
    new THREE.Vector3(1, 1, 1)
  );
  Mesh.dbId = dbId;
  modelBuilder.addMesh(Mesh);
  Mesh.position.set(x, y, z);
  Mesh.updateMatrix();
  modelBuilder.updateMesh(Mesh);
  return Mesh;
}

//Three Mesh方式
function addGeometryV2(modelBuilder, dbId,x,y,z) {
  console.log("到addGeo了");
  const boxGeometry = new THREE.BufferGeometry().fromGeometry(
    new THREE.BoxGeometry(10, 10, 10)
  );
  const boxMaterial = new THREE.MeshPhongMaterial({
    color: new THREE.Color(1, 0, 0),
  });
  const Mesh = new THREE.Mesh(boxGeometry, boxMaterial); 
  var position = new THREE.Vector3(x, y, z);
  Mesh.matrix = new THREE.Matrix4().compose(
    position,
    new THREE.Quaternion(0, 0, 0, 1),
    new THREE.Vector3(1, 1, 1)
  );
  Mesh.dbId = dbId;
  modelBuilder.addMesh(Mesh);
  Mesh.position.set(x, y, z);
  Mesh.updateMatrix();
  modelBuilder.updateMesh(Mesh);
  return Mesh;
}

//根據api生成模式
function addGeometryWithPosition(modelBuilder, dbId, x, y, z) {
  // 創建方塊幾何體
  const boxGeometry = new THREE.BufferGeometry().fromGeometry(
    new THREE.BoxGeometry(10, 10, 10)
  );

  // 創建物體材料
  const boxMaterial = new THREE.MeshPhongMaterial({
    color: new THREE.Color(1, 0, 0),
  });

  // 使用幾何體和材料創建網格物體
  const Mesh = new THREE.Mesh(boxGeometry, boxMaterial);

  // 設定物體位置
  const position = new THREE.Vector3(x, y, z);

  // 更新物體的變換矩陣
  Mesh.matrix = new THREE.Matrix4().compose(
    position,
    new THREE.Quaternion(0, 0, 0, 1),
    new THREE.Vector3(1, 1, 1)
  );

  // 設定dbId到模型上
  Mesh.dbId = dbId;

  // 向模型生成器添加此網格
  modelBuilder.addMesh(Mesh);

  // 再次設定位置並更新變換矩陣
  Mesh.position.set(x, y, z);
  Mesh.updateMatrix();

  // 更新模型生成器中的網格
  modelBuilder.updateMesh(Mesh);

  // 返回生成的網格
  return Mesh;
}

//模型載入
async function LoadSceneBuilder() {
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
  externalIdDictionary[dbid] = targetExternalId;
  deviceIdDictionary[dbid] = mesh.uuid;

  //當聚合模型被選擇切換
  viewer.addEventListener(
    Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
    async function (ev) {
      //取得選擇資訊
      const selection = await viewer.getAggregateSelection();
      console.log(selection);      

      //取得dbid
      var dbId = selection[0].selection[0];
      document.getElementById("dbid-input").value = dbId;

      //把externalId放進external字典，key是dbId，value是externalId
      externalIdDictionary[dbId] = targetExternalId;

      //檢查選擇的模型是額外添加的還是原本就有
      selectedMesh = MeshDictionary[dbId];

      console.log(selectedMesh);

      //當選擇的是額外添加模型
      if (selectedMesh != null) {
        // console.log(selectedMesh);

        //載入數值即可
        document.getElementById("x").value = selectedMesh.position.x.toFixed(2);
        document.getElementById("y").value = selectedMesh.position.y.toFixed(2);
        document.getElementById("z").value = selectedMesh.position.z.toFixed(2);

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

//模型載入2
async function LoadSceneBuilder2(modelDataList) {
  //載入modelDataList，其中包括externalID，dbId，tag，xyz
  for (let modelData of modelDataList) {
    console.log('看看運作次數');
    const { deviceId, dbId, tag, position,extendedId } = modelData;
    //載入外掛

    if(sceneBuilder == null){
      sceneBuilder = await viewer.loadExtension("Autodesk.Viewing.SceneBuilder");
    modelBuilder = await sceneBuilder.addNewModel({
      conserveMemory: false,
      modelNameOverride: "test",
    });
    }
    

    // 檢查是否dbId, deviceId, 或 position 有空值或未定義
    if (!dbId || !deviceId || !position) {
      console.warn("Incomplete model data detected, skipping:", modelData);
      continue; // 跳過這次迴圈，繼續處理下一個modelData
    }

    const [x, y, z] = position.split(",").map(Number);

    // 確保 x, y, z 都是有效的數字
    if ([x, y, z].some((val) => isNaN(val))) {
      console.warn("Invalid position data detected, skipping:", position);
      continue; // 跳過這次迴圈，繼續處理下一個modelData
    }

    // 建立模型使用addGeometryWithPosition (assuming it returns the mesh)
    const mesh = addGeometryWithPosition(modelBuilder, dbId, x, y, z);
    mesh.position.set(x, y, z);
    mesh.updateMatrix();

    // Update dictionaries:
    externalIdDictionary[dbId] = extendedId;
    deviceIdDictionary[dbId] = deviceId;
    MeshDictionary[dbId] = mesh;

    viewer.addEventListener(
      Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
      async function (ev) {
        //取得選擇資訊
        const selection = await viewer.getAggregateSelection();
        console.log(selection);        

        //取得dbid
        var dbId = selection[0].selection[0];
        document.getElementById("dbid-input").value = dbId;

        //把externalId放進external字典，key是dbId，value是externalId
        externalIdDictionary[dbId] = targetExternalId;

        //檢查選擇的模型是額外添加的還是原本就有
        selectedMesh = MeshDictionary[dbId];

        //當選擇的是額外添加模型
        if (selectedMesh != null) {
          // console.log(selectedMesh);

          //載入數值即可
          document.getElementById("x").value =
            selectedMesh.position.x.toFixed(2);
          document.getElementById("y").value =
            selectedMesh.position.y.toFixed(2);
          document.getElementById("z").value =
            selectedMesh.position.z.toFixed(2);

          //聚合模型額外添加模型更換位置
          document
            .getElementById("x")
            .addEventListener("input", updatePosition);
          document
            .getElementById("y")
            .addEventListener("input", updatePosition);
          document
            .getElementById("z")
            .addEventListener("input", updatePosition);
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
}

//模型載入
async function LoadSceneBuilder3(dbid,x,y,z,exId) {
  console.log("最新生成")
  //載入外掛
  sceneBuilder = await viewer.loadExtension("Autodesk.Viewing.SceneBuilder");
  modelBuilder = await sceneBuilder.addNewModel({
    conserveMemory: false,
    modelNameOverride: "test",
  });
 
  
  //生成模型
  const mesh = addGeometryV2(modelBuilder, dbid,x,y,z);

  //保存進額外模型字典
  MeshDictionary[dbid] = mesh;
  externalIdDictionary[dbid] = exId;
  

  //當聚合模型被選擇切換
  viewer.addEventListener(
    Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
    async function (ev) {
      //取得選擇資訊
      const selection = await viewer.getAggregateSelection();
      console.log(selection);      

      //取得dbid
      var dbId = selection[0].selection[0];
      document.getElementById("dbid-input").value = dbId;

      //把externalId放進external字典，key是dbId，value是externalId
      console.log(externalIdDictionary[dbid])
      console.log(dbId)
      console.log(tagDictionary[dbid])
      console.log(MeshDictionary[dbid].position);
      console.log(deviceIdDictionary[dbid]);
      //檢查選擇的模型是額外添加的還是原本就有
      selectedMesh = MeshDictionary[dbId];

      console.log(tagDictionary)
      var tag = tagDictionary[dbId]
      document.getElementById("markup-content-input").value = tag

      console.log(selectedMesh);

      //當選擇的是額外添加模型
      if (selectedMesh != null) {
        // console.log(selectedMesh);

        //載入數值即可
        document.getElementById("x").value = selectedMesh.position.x.toFixed(2);
        document.getElementById("y").value = selectedMesh.position.y.toFixed(2);
        document.getElementById("z").value = selectedMesh.position.z.toFixed(2);

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