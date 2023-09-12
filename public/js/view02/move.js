AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

var _hitPoint2 = null;
Autodesk.ADN.Viewing.Extension.TransformTool = function (viewer, options) {
  function TransformTool() {
    var _hitPoint = null;

    var _isDragging = false;

    var _transformMesh = null;

    var _modifiedFragIdMap = {};

    var _selectedFragProxyMap = {};

    var _transformControlTx = null;

    function createTransformMesh() {
      var material = new THREE.MeshPhongMaterial({ color: 0xff0000 });

      viewer.impl.matman().addMaterial(guid(), material, true);

      var sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.0001, 5),
        material
      );

      sphere.position.set(0, 0, 0);

      return sphere;
    }

    //   function onTxChange() {

    //     for(var fragId in _selectedFragProxyMap) {

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

    // 移動額外模型
    function onTxChange2() {
      if (selectedMesh != null) {
        selectedMesh.position.set(
          _transformMesh.position.x,
          _transformMesh.position.y,
          _transformMesh.position.z
        );
        selectedMesh.matrixAutoUpdate = true;
        selectedMesh.updateMatrix();
        modelBuilder.updateMesh(selectedMesh);
        selectedMesh.offset = _transformMesh.position;
        //載入數值即可
        document.getElementById("x").value = selectedMesh.position.x.toFixed(2);
        document.getElementById("y").value = selectedMesh.position.y.toFixed(2);
        document.getElementById("z").value = selectedMesh.position.z.toFixed(2);
        //console.log(selectedMesh.offset);
      } else {
        // for (var fragId in _selectedFragProxyMap) {
        //     var fragProxy = _selectedFragProxyMap[fragId];
        //     //目標位置是三維的位置減去自己的初始位置，
        //     const targetWorldPosition = new THREE.Vector3(
        //       _transformMesh.position.x,
        //       _transformMesh.position.y,
        //       _transformMesh.position.z
        //     );
        //     // //取得世界坐標
        //     const worldMatrix = new THREE.Matrix4();
        //     fragProxy.getWorldMatrix(worldMatrix);
        //     // //取得現在世界坐標
        //     const currentWorldPosition = new THREE.Vector3();
        //     currentWorldPosition.setFromMatrixPosition(worldMatrix);
        //     // //計算目標世界坐標和現在世界坐標的差距
        //     const translation = targetWorldPosition
        //       .clone()
        //       .sub(currentWorldPosition);
        //     fragProxy.position.add(translation);
        //     fragProxy.updateAnimTransform();
        //   }
      }
      viewer.impl.sceneUpdated(true);
    }

    function onCameraChanged() {
      if (_transformControlTx !== null) {
        _transformControlTx.update();
      }
    }

    //   function onItemSelected(event) {

    //     _selectedFragProxyMap = {};

    //     //component unselected

    //     if(!event.fragIdsArray.length) {

    //         _hitPoint = null;

    //         _transformControlTx.visible = false;

    //         _transformControlTx.removeEventListener(
    //             'change', onTxChange);

    //         viewer.removeEventListener(
    //             Autodesk.Viewing.CAMERA_CHANGE_EVENT,
    //             onCameraChanged);

    //         return;
    //     }

    //     if(_hitPoint) {

    //         _transformControlTx.visible = true;

    //         _transformControlTx.setPosition(_hitPoint);

    //         _transformControlTx.addEventListener(
    //             'change', onTxChange);

    //         viewer.addEventListener(
    //             Autodesk.Viewing.CAMERA_CHANGE_EVENT,
    //             onCameraChanged);

    //         event.fragIdsArray.forEach(function (fragId) {

    //             var fragProxy = viewer.impl.getFragmentProxy(
    //                 viewer.model,
    //                 fragId);

    //             fragProxy.getAnimTransform();

    //             var offset = {

    //                 x: _hitPoint.x - fragProxy.position.x,
    //                 y: _hitPoint.y - fragProxy.position.y,
    //                 z: _hitPoint.z - fragProxy.position.z
    //             };

    //             fragProxy.offset = offset;

    //             _selectedFragProxyMap[fragId] = fragProxy;

    //             _modifiedFragIdMap[fragId] = {};
    //         });

    //         _hitPoint = null;
    //     }
    //     else {

    //         _transformControlTx.visible = false;
    //     }
    // }

    function onAggregateItemSelected(event) {
      // 初始化_selectedFragProxyMap，此地圖用於儲存選擇的片段
      _selectedFragProxyMap = {};

      // 取得選擇資訊
      const selection = viewer.getAggregateSelection();
      console.log(selection);

      // 取得dbId
      var dbId = selection[0]?.selection[0];
      document.getElementById("dbid-input").value = dbId;

      // 檢查選擇的模型是額外添加的還是原本就有
      selectedMesh = MeshDictionary[dbId];

      // 是額外添加到
      if (selectedMesh != null) {
        console.log("hi");
        _transformControlTx.visible = true;
        console.log(selectedMesh);

        // 取得selectedMesh的BoundingBox中心點
        let boundingBox = new THREE.Box3().setFromObject(selectedMesh);
        let center = boundingBox.getCenter(new THREE.Vector3());

        // 將transformControl的位置設置為此中心點
        _transformControlTx.setPosition(center);

        _transformControlTx.addEventListener("change", onTxChange2);
      }
    }

    function normalize(screenPoint) {
      var viewport = viewer.navigation.getScreenViewport();

      var n = {
        x: (screenPoint.x - viewport.left) / viewport.width,
        y: (screenPoint.y - viewport.top) / viewport.height,
      };

      return n;
    }

    function getHitPoint(event) {
      var screenPoint = {
        x: event.clientX,
        y: event.clientY,
      };

      var n = normalize(screenPoint);

      var hitPoint = viewer.utilities.getHitPoint(n.x, n.y);
      //console.log(hitPoint);
      _hitPoint2 = hitPoint;
      return hitPoint;
    }

    this.getTransformMap = function () {
      var transformMap = {};

      for (var fragId in _modifiedFragIdMap) {
        var fragProxy = viewer.impl.getFragmentProxy(viewer.model, fragId);

        fragProxy.getAnimTransform();

        transformMap[fragId] = {
          position: fragProxy.position,
        };

        fragProxy = null;
      }

      return transformMap;
    };

    this.getNames = function () {
      return ["Dotty.Viewing.Tool.TransformTool"];
    };

    this.getName = function () {
      return "Dotty.Viewing.Tool.TransformTool";
    };

    this.activate = function () {
      viewer.select([]);

      var bbox = viewer.model.getBoundingBox();

      viewer.impl.createOverlayScene("Dotty.Viewing.Tool.TransformTool");

      _transformControlTx = new THREE.TransformControls(
        viewer.impl.camera,
        viewer.impl.canvas,
        "translate"
      );

      _transformControlTx.setSize(bbox.getBoundingSphere().radius * 5);

      _transformControlTx.visible = false;

      viewer.impl.addOverlay(
        "Dotty.Viewing.Tool.TransformTool",
        _transformControlTx
      );

      _transformMesh = createTransformMesh();

      _transformControlTx.attach(_transformMesh);

      viewer.addEventListener(
        Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
        onAggregateItemSelected
      );

      // viewer.addEventListener(
      //   Autodesk.Viewing.SELECTION_CHANGED_EVENT,
      //   onItemSelected
      // );
    };

    this.deactivate = function () {
      viewer.impl.removeOverlay(
        "Dotty.Viewing.Tool.TransformTool",
        _transformControlTx
      );

      _transformControlTx.removeEventListener("change", onTxChange);

      _transformControlTx = null;

      viewer.impl.removeOverlayScene("Dotty.Viewing.Tool.TransformTool");

      viewer.removeEventListener(
        Autodesk.Viewing.CAMERA_CHANGE_EVENT,
        onCameraChanged
      );

      viewer.removeEventListener(
        Autodesk.Viewing.SELECTION_CHANGED_EVENT,
        onItemSelected
      );
    };

    this.update = function (t) {
      return false;
    };

    this.handleSingleClick = function (event, button) {
      return false;
    };

    this.handleDoubleClick = function (event, button) {
      return false;
    };

    this.handleSingleTap = function (event) {
      return false;
    };

    this.handleDoubleTap = function (event) {
      return false;
    };

    this.handleKeyDown = function (event, keyCode) {
      return false;
    };

    this.handleKeyUp = function (event, keyCode) {
      return false;
    };

    this.handleWheelInput = function (delta) {
      return false;
    };

    this.handleButtonDown = function (event, button) {
      _hitPoint = getHitPoint(event);

      _isDragging = true;

      if (_transformControlTx.onPointerDown(event)) return true;

      //return _transRotControl.onPointerDown(event);
      return false;
    };

    ///////////////////////////////////////////////////////////////////////////
    this.handleButtonUp = function (event, button) {
      const label = document.getElementById("markup-content-input");
      label.value = "鬆開";
      _isDragging = false;

      if (_transformControlTx.onPointerUp(event)) return true;

      //return _transRotControl.onPointerUp(event);
      return false;
    };

    this.handleMouseMove = function (event) {
      // const label = document.getElementById("markup-content-input")
      // label.value = "移動中"
      if (_isDragging) {
        if (_transformControlTx.onPointerMove(event)) {
          return true;
        }

        return false;
      }

      if (_transformControlTx.onPointerHover(event)) return true;

      //return _transRotControl.onPointerHover(event);
      return false;
    };

    this.handleGesture = function (event) {
      return false;
    };

    this.handleBlur = function (event) {
      return false;
    };

    this.handleResize = function () {};
  }

  Autodesk.Viewing.Extension.call(this, viewer, options);

  var _self = this;

  _self.tool = null;

  _self.load = function () {
    console.log("Autodesk.ADN.Viewing.Extension.TransformTool loaded");

    return true;
  };

  _self.onToolbarCreated = function () {
    // Create a new toolbar group if it doesn't exist
    this._group = this.viewer.toolbar.getControl("transformExtensionsToolbar");
    if (!this._group) {
      this._group = new Autodesk.Viewing.UI.ControlGroup(
        "transformExtensionsToolbar"
      );
      this.viewer.toolbar.addControl(this._group);
    }

    // Add a new button to the toolbar group
    this._button = new Autodesk.Viewing.UI.Button("transformExtensionButton");
    this._button.icon.classList.add("fas", "fa-arrows-alt");

    this._button.onClick = (ev) => {
      // Execute an action here
      if (this._button.getState() !== Autodesk.Viewing.UI.Button.State.ACTIVE) {
        _self.initialize();
        this._button.setState(Autodesk.Viewing.UI.Button.State.ACTIVE);
      } else {
        viewer.toolController.deactivateTool(_self.tool.getName());
        this._button.setState(Autodesk.Viewing.UI.Button.State.INACTIVE);
      }
    };
    this._button.setToolTip("Transform Object");
    this._group.addControl(this._button);
  };

  _self.initialize = function () {
    _self.tool = new TransformTool();

    viewer.toolController.registerTool(_self.tool);

    if (this.viewer.model.getInstanceTree()) {
      _self.customize();
    } else {
      this.viewer.addEventListener(
        Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT,
        _self.customize()
      );
    }
  };

  _self.customize = function () {
    viewer.toolController.activateTool(_self.tool.getName());
  };

  _self.unload = function () {
    if (_self.tool) viewer.toolController.deactivateTool(_self.tool.getName());
    // Clean our UI elements if we added any
    if (this._group) {
      this._group.removeControl(this._button);
      if (this._group.getNumberOfControls() === 0) {
        this.viewer.toolbar.removeControl(this._group);
      }
    }
    console.log("Autodesk.ADN.Viewing.Extension.TransformTool unloaded");

    return true;
  };

  function guid() {
    var d = new Date().getTime();

    var guid = "xxxx-xxxx-xxxx-xxxx-xxxx".replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == "x" ? r : (r & 0x7) | 0x8).toString(16);
    });

    return guid;
  }
};

Autodesk.ADN.Viewing.Extension.TransformTool.prototype = Object.create(
  Autodesk.Viewing.Extension.prototype
);

Autodesk.ADN.Viewing.Extension.TransformTool.prototype.constructor =
  Autodesk.ADN.Viewing.Extension.TransformTool;

Autodesk.Viewing.theExtensionManager.registerExtension(
  "TransformationExtension",
  Autodesk.ADN.Viewing.Extension.TransformTool
);
