// addGeometry.js
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
  
  function addGeometryV2(modelBuilder, dbId) {
    const sphereGeometry = new THREE.BufferGeometry().fromGeometry(new THREE.SphereGeometry(5, 8, 8));
    const sphereMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color(0, 1, 0) });
    const sphereTransform = new THREE.Matrix4().compose(
      new THREE.Vector3(0, 0, 0),
      new THREE.Quaternion(0, 0, 0, 1),
      new THREE.Vector3(1, 1, 1)
    );
    const sphereFragId = modelBuilder.addFragment(sphereGeometry, sphereMaterial, sphereTransform);
    modelBuilder.changeFragmentsDbId(sphereFragId, dbId);
  }
  
  function addGeometryV3(modelBuilder, dbId) {
    const cylinderGeometry = new THREE.BufferGeometry().fromGeometry(new THREE.CylinderGeometry(5, 5, 10));
    const cylinderMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color(0, 0, 1) });
    const cylinderTransform = new THREE.Matrix4().compose(
      new THREE.Vector3(+10, +10, 0),
      new THREE.Quaternion(0, 0, 0, 1),
      new THREE.Vector3(1, 1, 1)
    );
    modelBuilder.addMaterial('MyCustomMaterial', cylinderMaterial);
    const cylinderGeomId = modelBuilder.addGeometry(cylinderGeometry);
    const cylinderFragId = modelBuilder.addFragment(cylinderGeomId, 'MyCustomMaterial', cylinderTransform);
    modelBuilder.changeFragmentsDbId(cylinderFragId, dbId);
  }

  