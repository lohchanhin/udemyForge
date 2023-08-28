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
                deviceList = deviceData; // Update deviceList with the fetched data
                // 从这里开始是新的部分，用于生成标签并将它们添加到deviceLabels div。
                const deviceLabelsDiv = document.getElementById('deviceLabels');
                deviceLabelsDiv.innerHTML = ''; // 先清空现有标签
            
                deviceList.forEach(device => {
                    const deviceCard = document.createElement('div');
                    deviceCard.classList.add('device-card'); // 为容器添加类，以便稍后应用样式
                
                    for (const key in device) {
                        const label = document.createElement('label');
                        label.textContent = `${key}: ${device[key]}`;
                        deviceCard.appendChild(label);
                        deviceCard.appendChild(document.createElement('br')); // 在标签之间添加换行
                    }
                
                    deviceLabelsDiv.appendChild(deviceCard);
                });
              })
        })
        .catch(error => {
            console.error("请求失败:", error);
        });
    }
}