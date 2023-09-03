async function addIcon() {
  // 讀取輸入的 dbid 和標記內容
  const dbid = document.getElementById("dbid-input").value;
  const label = document.getElementById("markup-content-input").value;

  //載入全局變數
  var icon = icons2;

  // 檢查 icons 陣列是否已經包含該 dbid，如果有，則進行更新
  let existingIcon = icon.find((icon) => icon.dbId === parseInt(dbid));
  if (existingIcon) {
    existingIcon.label = label;
    // 檢查是否為額外模型的dbid
    if (MeshDictionary[parseInt(dbid)]) {
      tagDictionary[parseInt(dbid)] = label;
    }
  } else {
    icon.push({
      dbId: parseInt(dbid),
      label: label,
      css: "fas fa-thumb-tack",
    });
    // 如果是額外模型的dbid
    if (MeshDictionary[parseInt(dbid)]) {
      tagDictionary[parseInt(dbid)] = label;
    }
  }

  // 載入插件
  console.log(icon, viewer);
  icons2 = icon;
  await loadExtensions(icon, viewer);
}

async function addIconForDownloadedModel(modelDataList) {
  // 載入全局變數
  var icon = icons2;

  for (let modelData of modelDataList) {
      const { dbId, tag } = modelData;

      // 如果 dbId 或 tag 為空，則跳過這筆數據
      if (!dbId || !tag) {
          continue; // 跳到下一次迭代
      }
    
      // 檢查 icons 陣列是否已經包含該 dbId，如果有，則進行更新
      let existingIcon = icon.find((icon) => icon.dbId === parseInt(dbId));
      if (existingIcon) {
          existingIcon.label = tag;
      } else {
          icon.push({
              dbId: parseInt(dbId),
              label: tag,
              css: "fas fa-thumb-tack",
          });
      }

      // 如果是額外模型的dbid
      if (MeshDictionary[parseInt(dbId)]) {
          tagDictionary[parseInt(dbId)] = tag;
      }
  }

  // 載入插件
  console.log(icon, viewer);
  icons2 = icon;
  console.log(icons2)
  await loadExtensions(icon, viewer);
}
