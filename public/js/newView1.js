// 从 DOM 中获取用于承载 viewer 的元素
var myViewerDiv = document.getElementById("MyViewerDiv");

//icons管理
var icons2 = [];

//viewer全局變數
var viewer = null;

//SceneBuilder全局變數
let selectedMesh; //添加額外的模型
let modelBuilder; //外掛
let sceneBuilder; //外掛
let MeshDictionary = {}; //字典
let generatedNumbers = new Set(); //dbid是否相同


//面板數值
let panelValues = {};
let modelPositions = {};

//Api處理
let targetExternalId;
let externalIdDictionary = {};
let tagDictionary = {};

// 配置 Autodesk viewer 的选项
var options = {
  env: "Local",
  document: "../bimac/3D View/3d/3d.svf",
};

async function start() {
  viewer = await initializeViewer(
    options,
    myViewerDiv,
    panelValues,
    modelPositions
  );
  await loadExtensions(icons2, viewer);
}

start();

//添加模型
const button = document.getElementById("add-geom");
button.addEventListener("click", LoadSceneBuilder);

// //添加標籤
const button2 = document.getElementById("add-icon-button");
button2.addEventListener("click", addIcon);


document.getElementById("uploadDataBtn").addEventListener("click", uploadModelData);
document.getElementById("downloadDataBtn").addEventListener("click", downloadModelData);



dropdownMain();
