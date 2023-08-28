


  async function addIcon (){
     // 讀取輸入的 dbid 和標記內容
     const dbid = document.getElementById("dbid-input").value;
     const label = document.getElementById("markup-content-input").value;
     
     //載入全局變數
     var icon = icons2

     // 檢查 icons 陣列是否已經包含該 dbid，如果有，則進行更新
     let existingIcon = icon.find((icon) => icon.dbId === parseInt(dbid));
     if (existingIcon) {
       existingIcon.label = label;
     } else {
       // 將新的 icon 添加到 icons 陣列
       icon.push({
         dbId: parseInt(dbid),
         label: label,
         css: "fas fa-thumb-tack",
       });
     }
 
     // 載入插件
     console.log(icon , viewer)
     icons2 = icon
     await loadExtensions(icon,viewer);
  }