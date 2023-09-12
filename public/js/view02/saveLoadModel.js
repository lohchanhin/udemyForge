async function uploadModelData() {
  // 定義 API 相關的參數
  const API_URL =
    "https://asia-northeast1-dynamicewofe.cloudfunctions.net/wofebimapi/updateDevicePos?gId=eto3PQkxP9pHxJvL58qT&&wId=b4bXKGcoFttuBhAsI0Ce";
  const HEADERS = {
    "content-type": "application/json",
  };

  for (let dbId in MeshDictionary) {
    let positionObj = MeshDictionary[dbId].position;
    let formattedPosition = `${positionObj.x},${positionObj.y},${positionObj.z}`;

    let uploadData = {
      // deviceId: externalIdDictionary[dbId] || "",
      // deviceId: "28ef4e1d-e9a1-4766-bbcf-d8f3e9480815",
      dbId: dbId.toString(), // 將 dbId 轉為字符串
      tag: tagDictionary[dbId] || "",
      position: formattedPosition, // 使用格式化的位置字符串
      deviceId:deviceIdDictionary[dbId],
      extendedId:externalIdDictionary[dbId],
    };

    //console.log(externalIdDictionary);
    console.log(uploadData);
    try {
      // 使用 fetch 進行上傳
      let response = await fetch(API_URL, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify(uploadData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      } else {
        // Check if the response is JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          let responseData = await response.json();
          console.log(
            `Data uploaded successfully for dbId ${dbId}. Response:`,
            responseData
          );
        } else {
          console.log(
            `Data uploaded successfully for dbId ${dbId}. Response:`,
            await response.text()
          );
        }
      }
    } catch (error) {
      console.error(`Failed to upload data for dbId ${dbId}. Error:`, error);
    }
  }
}

async function updateModelData(){
    // 定義 API 相關的參數
    const API_URL =
    "https://asia-northeast1-dynamicewofe.cloudfunctions.net/wofebimapi/updateDeviceByDbId?gId=eto3PQkxP9pHxJvL58qT&&wId=b4bXKGcoFttuBhAsI0Ce";
  const HEADERS = {
    "content-type": "application/json",
  };

  for (let dbId in MeshDictionary) {
    let positionObj = MeshDictionary[dbId].position;
    let formattedPosition = `${parseFloat(positionObj.x).toFixed(2)},${parseFloat(positionObj.y).toFixed(2)},${parseFloat(positionObj.z).toFixed(2)}`;


    let uploadData = {
      // deviceId: externalIdDictionary[dbId] || "",
      // deviceId: "28ef4e1d-e9a1-4766-bbcf-d8f3e9480815",
      dbId: dbId.toString(), // 將 dbId 轉為字符串
      tag: tagDictionary[dbId] || "",
      position: formattedPosition, // 使用格式化的位置字符串
      //deviceId:deviceIdDictionary[dbId],
      extendedId:externalIdDictionary[dbId],
    };

    //console.log(externalIdDictionary);
    console.log(uploadData);
    try {
      // 使用 fetch 進行上傳
      let response = await fetch(API_URL, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify(uploadData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      } else {
        // Check if the response is JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          let responseData = await response.json();
          console.log(
            `Data uploaded successfully for dbId ${dbId}. Response:`,
            responseData
          );
        } else {
          console.log(
            `Data uploaded successfully for dbId ${dbId}. Response:`,
            await response.text()
          );
        }
      }
    } catch (error) {
      console.error(`Failed to upload data for dbId ${dbId}. Error:`, error);
    }
  }
}

const API_BASE_URL =
  "https://asia-northeast1-dynamicewofe.cloudfunctions.net/wofebimapi";
const HEADERS = {
  "content-type": "application/json",
};

async function apiCall(endpoint, method = "GET", body = null) {
  const url = `${API_BASE_URL}/${endpoint}?gId=eto3PQkxP9pHxJvL58qT&&wId=b4bXKGcoFttuBhAsI0Ce`;
  let options = {
    method: method,
    headers: HEADERS,
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  let response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return await response.json();
}

async function getBuildingAndFloors() {
  return await apiCall("getbuildingList");
}

async function getModelData(building, floor) {
  return await apiCall("getDevicePosList", "POST", {
    building: building,
    floor: floor,
  });
}

async function downloadModelData() {
  try {
    const buildings = await getBuildingAndFloors();
    console.log(buildings);
    for (let buildingData of buildings) {
      const buildingName = buildingData.building;
      console.log(buildingName);
      for (let floor of buildingData.floors) {
        console.log(buildingName, floor);
        const modelDataList = await getModelData(buildingName, floor);
        console.log("Returned data:", modelDataList);
        LoadSceneBuilder2(modelDataList)
        await addIconForDownloadedModel(modelDataList);
      }
    }
  } catch (error) {
    console.error("Error while downloading model data:", error);
  }
}
