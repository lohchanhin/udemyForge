var viewer = null;

// 在文件開頭引入 THREE
const THREE = window.THREE;

function addGeometryV1(modelBuilder, dbId) {
    const boxGeometry = new THREE.BufferGeometry().fromGeometry(new THREE.BoxGeometry(10, 10, 10));
    const boxMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color(1, 0, 0) });
    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    boxMesh.matrix = new THREE.Matrix4().compose(
      new THREE.Vector3(-10, -10, 0),
      new THREE.Quaternion(0, 0, 0, 1),
      new THREE.Vector3(1, 1, 1)
    );
    boxMesh.dbId = dbId;
    modelBuilder.addMesh(boxMesh);
  }

var myViewerDiv = document.getElementById('MyViewerDiv');
viewer = new Autodesk.Viewing.Private.GuiViewer3D(myViewerDiv);
var options = {
    'env' : 'Local',
    'document':'../shaver/0.svf'
};

Autodesk.Viewing.Initializer(options, function() {
  viewer.start(options.document, options, function() {
    viewer.loadExtension('Autodesk.Viewing.SceneBuilder').then(function(sceneBuilderExtension) {
      const modelBuilder = sceneBuilderExtension.addNewModel({ conserveMemory: false });
      addGeometryV1(modelBuilder, 123456);
      viewer.invalidate(true, true, true);
      viewer.fitToView([123456], modelBuilder.model);
    });
  });
});

// 監聽按鈕的點擊事件
document.getElementById('addGeometryButton').addEventListener('click', function() {
    if (viewer) {
        viewer.loadExtension('Autodesk.Viewing.SceneBuilder').then(function(sceneBuilderExtension) {
            const modelBuilder = sceneBuilderExtension.addNewModel({ conserveMemory: false });
            addGeometryV1(modelBuilder, 123456);
            viewer.invalidate(true, true, true);
            viewer.fitToView([123456], modelBuilder.model);
        });
    }
});
