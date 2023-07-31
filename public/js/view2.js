var floorDbIds = {}; // 全局变量，用于存储每个楼层的 dbIds
var allDbIds = []; // 全局变量，用于存储所有的 dbIds

var viewer = null;
var myViewerDiv = document.getElementById('MyViewerDiv');

viewer = new Autodesk.Viewing.Private.GuiViewer3D(myViewerDiv);

var options = {
    'env' : 'Local',
    'document' : '../bimac/3D View/3d/3d.svf'         
};


function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function getDbIds() {
    console.log('getDbIds called'); // 添加这一行
    await delay(2000);  // 等待 2 秒
    console.log(viewer.model.getData());
    var result = Object.keys(viewer.model.getData().instanceTree.nodeAccess.dbIdToIndex).map(Number);
    console.log('getDbIds finished, result:', result); // 添加这一行
    allDbIds = result; // 将结果保存到全局变量
    return result;
}


async function getFloorPropertyValues(dbIds) {
    const propertyName = "樓層";
    const floorPropertyValues = new Set();

    async function getFloorProperty(dbId) {
        return new Promise((resolve) => {
            viewer.getProperties(dbId, (properties) => {
                const floorProperty = properties.properties.find(
                (prop) => prop.displayName === propertyName
                );

                if (floorProperty) {
                    const floorValue = floorProperty.displayValue;
                    floorPropertyValues.add(floorValue);
                    if (floorDbIds[floorValue]) {
                        floorDbIds[floorValue].push(dbId);
                    } else {
                        floorDbIds[floorValue] = [dbId];
                    }
                }

                resolve();
            });

            setTimeout(() => {
                resolve();
            }, 5000); // 超時時間設置為 5000 毫秒 (5 秒)
        });
    }

    const promises = dbIds.map(getFloorProperty);
    await Promise.all(promises);
    return floorPropertyValues; // 返回楼层属性值和楼层 dbIds
}

async function createFloorButtons(floorPropertyValuesArray) {
    const floorsDiv = document.getElementById("floors");
    for (const value of floorPropertyValuesArray) {
        const button = document.createElement("button");
        button.textContent = `Floor: ${value}`;
        button.onclick = async () => {
            const floorValue = value;        
            const selectedDbIds = floorDbIds[floorValue];
            viewer.hide(allDbIds); // 使用全局变量
            viewer.show(selectedDbIds)
        };
        floorsDiv.appendChild(button);
    }
}

Autodesk.Viewing.Initializer(options, () => {
    viewer.start(options.document, options);
    console.log('Viewer started'); // 添加这一行
    viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, async () => {
        console.log('GEOMETRY_LOADED_EVENT triggered'); // 添加这一行
        const element = document.getElementsByClassName("adsk-viewing-viewer");
        element[0].style.width = "70%"

        const dbIds = await getDbIds();
        const floorPropertyValues = await getFloorPropertyValues(dbIds);
        const floorPropertyValuesArray = Array.from(floorPropertyValues);
        createFloorButtons(floorPropertyValuesArray);
    });
});
