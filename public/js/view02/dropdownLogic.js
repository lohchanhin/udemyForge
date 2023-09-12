// 解析URL并获取参数的函数
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }
  
  // 使用上述函数来获取gld和wld的值
  const gld = getQueryParam("gld");
  const wld = getQueryParam("wld");
  
  let buildingList = [];
  let roomList = [];
  let deviceList = [];
  
  // 验证是否成功获取到参数
  if (!gld || !wld) {
      console.error("gld或wld参数缺失！");
      // 这里可以添加其他错误处理逻辑
  } else {
      const apiUrl = `https://asia-northeast1-dynamicewofe.cloudfunctions.net/wofebimapi/getbuildingList?gId=${gld}&&wId=${wld}`;
      const apiUrl2 = `https://asia-northeast1-dynamicewofe.cloudfunctions.net/wofebimapi/getRoomList?gId=${gld}&&wId=${wld}`;
      const apiUrl3 = `https://asia-northeast1-dynamicewofe.cloudfunctions.net/wofebimapi/getDeviceList?gId=${gld}&&wId=${wld}`;
  
      async function fetchDataAndLog(apiUrl, method = 'GET', bodyData = null) {
          const options = {
              method: method,
              headers: {
                  'Content-Type': 'application/json'
              },
              body: bodyData ? JSON.stringify(bodyData) : null
          };
  
          const response = await fetch(apiUrl, options);
          const data = await response.json();
          return data;
      }
  
      fetchDataAndLog(apiUrl)
      .then(data => {
          buildingList = data;
  
          const building = data[0].building;
          const floors = data[0].floors;
  
          // 为每一层楼发送POST请求
          return Promise.all(floors.map(async floor => {
              const postData = {
                  building: building,
                  floor: floor
              };
              
              const roomData = await fetchDataAndLog(apiUrl2, 'POST', postData);
              roomList.push(...roomData);
              const deviceData = await fetchDataAndLog(apiUrl3, 'POST', postData);
              deviceList.push(...deviceData);
          }));
      })
      .then(() => {
          console.log('Building List:', buildingList);
          console.log('Room List:', roomList);
          console.log('Device List:', deviceList);
  
          // For buildings
          populateDropdown('buildingListDropdown', buildingList.map(building => building.building));
  
          // For floors of the first building
          populateDropdown('roomListDropdown', roomList.map(room => room.floor));
      })
      .catch(error => {
          console.error("请求失败:", error);
      });
  }
  
  function populateDropdown(dropdownId, values) {
      const dropdown = document.getElementById(dropdownId);
      dropdown.innerHTML = ''; // Clear existing options
    
      values.forEach(val => {
          const option = document.createElement('option');
          option.value = val;
          option.textContent = val;
          dropdown.appendChild(option);
      });
  }
  


function dropdownMain(){
    // 使用上述函数来获取gld和wld的值
    const gld = getQueryParam("gld");
    const wld = getQueryParam("wld");

    // 验证是否成功获取到参数
    if (!gld || !wld) {
        console.error("gld或wld参数缺失！");
        // 这里可以添加其他错误处理逻辑
    } else {
        const apiUrl = `https://asia-northeast1-dynamicewofe.cloudfunctions.net/wofebimapi/getbuildingList?gId=${gld}&&wId=${wld}`;
        const apiUrl2 = `https://asia-northeast1-dynamicewofe.cloudfunctions.net/wofebimapi/getRoomList?gId=${gld}&&wId=${wld}`;
        const apiUrl3 = `https://asia-northeast1-dynamicewofe.cloudfunctions.net/wofebimapi/getDeviceList?gId=${gld}&&wId=${wld}`;

        async function fetchDataAndLog(apiUrl, method = 'GET', bodyData = null) {
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: bodyData ? JSON.stringify(bodyData) : null
            };

            const response = await fetch(apiUrl, options);
            const data = await response.json();
            return data;
        }

        fetchDataAndLog(apiUrl)
        .then(data => {
            buildingList = data;

            const building = data[0].building;
            const floors = data[0].floors;
            console.log(floors)
            // 为每一层楼发送POST请求
            return Promise.all(floors.map(async floor => {
                const postData = {
                    building: building,
                    floor: floor
                };
                
                const roomData = await fetchDataAndLog(apiUrl2, 'POST', postData);
                roomList.push(...roomData);
                const deviceData = await fetchDataAndLog(apiUrl3, 'POST', postData);
                deviceList.push(...deviceData);
            }));
        })
        .then(() => {
            console.log('Building List:', buildingList);
            console.log('Room List:', roomList);
            console.log('Device List:', deviceList);

            // For buildings
            populateDropdown('buildingListDropdown', buildingList.map(building => building.building));

            // For floors of the first building
            populateDropdown('roomListDropdown', roomList.map(room => room.floor));


            document.getElementById('buildingListDropdown').addEventListener('change', (e) => {
                const selectedBuilding = buildingList.find(building => building.building === e.target.value);
            
                if (selectedBuilding) {
                    populateDropdown('roomListDropdown', selectedBuilding.floors);
                } else {
                    document.getElementById('roomListDropdown').innerHTML = ''; // Clear the dropdown if no building matches
                }
            });
            
            document.getElementById('roomListDropdown').addEventListener('change', async (e) => {
                const selectedBuilding = document.getElementById('buildingListDropdown').value;
                const selectedFloor = e.target.value;
                const apiUrl3 = `https://asia-northeast1-dynamicewofe.cloudfunctions.net/wofebimapi/getDeviceList?gId=${gld}&&wId=${wld}`;
            
                const response = await fetch(apiUrl3, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "building": selectedBuilding,
                        "floor": selectedFloor
                    })
                });
            
                const deviceData = await response.json();
                console.log(deviceData)
                deviceList = deviceData; 
                const deviceLabelsDiv = document.getElementById('deviceLabels');
                deviceLabelsDiv.innerHTML = ''; 
            
                deviceList.forEach(device => {
                    const deviceCard = document.createElement('div');
                    deviceCard.classList.add('device-card');
            
                    for (const key in device) {
                        const label = document.createElement('label');
                        label.textContent = `${key}: ${device[key]}`;
                        deviceCard.appendChild(label);
            
                        // 如果键是 "extendedId"，则在标签旁边添加一个按钮
                        if (key === "extendedId") {
                            const button = document.createElement('button');
                            button.textContent = "新增按鈕"; // 设置按钮文本
                            button.onclick = () => {
                                // TODO: 在这里添加您的按钮函数
                                const positions = device.position.split(",").map(parseFloat); 
                                const [x, y, z] = positions;
                                console.log(x,y,z);
                                const {dbId,tag,position,extendedId,deviceId} = device;
                                deviceIdDictionary[dbId] = deviceId;
                                LoadSceneBuilder3(dbId,x,y,z,extendedId);
                                addIcon2(device)
                                console.log(`Button clicked for extendedId: ${device[key]}`);

                            }
                            deviceCard.appendChild(button);
                        }
            
                        deviceCard.appendChild(document.createElement('br'));
                    }
            
                    deviceLabelsDiv.appendChild(deviceCard);
                });
            });
            
        })
        .catch(error => {
            console.error("请求失败:", error);
        });
    }
}