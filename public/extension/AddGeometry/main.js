//添加模型

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
  
//Three Object方式
function addGeometryV2(modelBuilder){
    red = new THREE.MeshPhongMaterial({
      color: new THREE.Color(1, 0, 0)
  });
  torus = new THREE.BufferGeometry().fromGeometry(new THREE.TorusGeometry(10, 2, 32, 32));

  const transform = new THREE.Matrix4().compose(
      new THREE.Vector3(19, 0, 0),
      new THREE.Quaternion(0, 0, 0, 1),
      new THREE.Vector3(1, 1, 1)
  );
  modelBuilder.addFragment(torus, red, transform);
}

//graphics separately 方式
function addGeometryV3(modelBuilder){
  purple = new THREE.MeshPhongMaterial({
      color: new THREE.Color(1, 0, 1)
  });
  modelBuilder.addMaterial('purple', purple);
  box = new THREE.BufferGeometry().fromGeometry(new THREE.BoxGeometry(10, 10, 10));
  let id = modelBuilder.addGeometry(box);

    const transform = new THREE.Matrix4().compose(
      new THREE.Vector3(-15, 0, 0),
      new THREE.Quaternion(0, 0, 0, 1),
      new THREE.Vector3(1, 1, 1)
  );
  modelBuilder.addFragment(1, 'purple', transform);
}