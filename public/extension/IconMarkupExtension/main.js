// 定義一個類別 IconMarkupExtension，擴展了 Autodesk.Viewing.Extension
class IconMarkupExtension extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);  // 調用父類構造函數
        this._group = null;     // 初始化工具欄群組
        this._button = null;    // 初始化按鈕
        this._icons = options.icons || [];  // 初始化圖標列表，如果沒有指定，則為空陣列
    }

    // 擴展加載的方法
    load() {
        console.log("載入icon標記");
        // 判斷模型是否已經加載，如果已加載則調用customize()方法
        if (this.viewer.model.getInstanceTree()) {
            this.customize();
        } else { 
            // 如果模型還沒有加載，則監聽模型加載事件，然後調用customize()方法
            this.viewer.addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, this.customize());
        }        
        return true;
    }

    // 擴展卸載的方法
    unload() {
        // 如果已經添加了 UI 元素，則在這裡清除
        if (this._group) {
            this._group.removeControl(this._button);
            if (this._group.getNumberOfControls() === 0) {
                this.viewer.toolbar.removeControl(this._group);
            }
        }
        // 移除添加的標記元素
        $('#' + this.viewer.clientContainer.id + ' div.adsk-viewing-viewer label.markup').remove();
        return true;
    }

    // 自定義的方法，用於在模型發生變化時更新圖標
    customize(){
        const updateIconsCallback = () => {
            if (this._enabled) {
                this.updateIcons();
            }
        };
        // 添加事件監聽器，當相應的事件觸發時，調用updateIconsCallback方法
        this.viewer.addEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, updateIconsCallback);
        this.viewer.addEventListener(Autodesk.Viewing.ISOLATE_EVENT, updateIconsCallback);
        this.viewer.addEventListener(Autodesk.Viewing.HIDE_EVENT, updateIconsCallback);
        this.viewer.addEventListener(Autodesk.Viewing.SHOW_EVENT, updateIconsCallback);
    }

    // Toolbar創建時的回調函數
    onToolbarCreated() {
        // 如果工具欄群組不存在，則新建一個
        this._group = this.viewer.toolbar.getControl('customExtensions');
        if (!this._group) {
            this._group = new Autodesk.Viewing.UI.ControlGroup('customExtensions');
            this.viewer.toolbar.addControl(this._group);
        }

        // 在工具欄群組中新增一個按鈕
        this._button = new Autodesk.Viewing.UI.Button('IconExtension');
        this._button.onClick = (ev) => {
            // 切換按鈕的狀態，並根據按鈕的狀態顯示或隱藏圖標
            this._enabled = !this._enabled;
            this.showIcons(this._enabled);
            this._button.setState(this._enabled ? 0 : 1);

        };
        this._button.setToolTip(this.options.button.tooltip);
        this._button.icon.classList.add('fas', this.options.button.icon);
        this._group.addControl(this._button);
    }

    showIcons(show) {
        const $viewer = $('#' + this.viewer.clientContainer.id + ' div.adsk-viewing-viewer');
        console.log("Entered showIcons function");
    
        // remove previous...
        $('#' + this.viewer.clientContainer.id + ' div.adsk-viewing-viewer label.markup').remove();
        if (!show) {
            console.log("Show is set to false, exiting function");
            return;
        }
    
        // do we have anything to show?
        if (this._icons === undefined || this.icons === null) {
            console.log("No icons to show, exiting function");
            return;
        }
    
        // do we have access to the instance tree?
        const tree = this.viewer.model.getInstanceTree();
        if (tree === undefined) {
            console.log('Loading tree...'); 
            return; 
        }
    
        const onClick = (e) => {
            console.log("Label clicked, with dbId:", $(e.currentTarget).data('id'));
            this.viewer.select($(e.currentTarget).data('id'));
            this.viewer.utilities.fitToView();
        };
    
        this._frags = {}
        for (var i = 0; i < this._icons.length; i++) {
            console.log(`Processing icon ${i} with dbId: ${this._icons[i].dbId}`);
            
            const icon = this._icons[i];
            this._frags['dbId' + icon.dbId] = []
            
            const $label = $(`
            <label class="markup update" data-id="${icon.dbId}">
                <i class="fa-solid fa-marker ${icon.css}"></i> ${icon.label || ''}
            </label>
            `);
    
            $label.css('display', this.viewer.isNodeVisible(icon.dbId) ? 'block' : 'none');
            $label.on('click', this.options.onClick || onClick);
            $viewer.append($label);
    
            const getChildren = (topParentId, dbId) => {
                console.log(`Getting children for topParentId: ${topParentId} and dbId: ${dbId}`);
                if (tree.getChildCount(dbId) === 0)
                    getFrags(topParentId, dbId);
                tree.enumNodeChildren(dbId, (childId) => {
                    getChildren(topParentId, childId);
                })
            }
    
            const getFrags = (topParentId, dbId) => {
                console.log(`Getting frags for topParentId: ${topParentId} and dbId: ${dbId}`);
                
                let foundFrag = tree.enumNodeFragments(dbId);
                
                console.log(foundFrag)

                tree.enumNodeFragments(dbId, (fragId) => {                    
                    console.log(`Found fragId: ${fragId} for dbId: ${dbId}`);
                    this._frags['dbId' + topParentId].push(fragId);
                    this.updateIcons();
                });
            
                
                
               
                
                if (foundFrag == null) {
                    console.log('聚合模型調整位置');
                
                    const mesh = MeshDictionary[dbId];
                    console.log(mesh);
                    console.log(mesh.position);
                    
                    if (mesh && mesh.position) {
                        const position = mesh.position;
                
                        // Set icon position to the aggregate model's x and y coordinates
                        const $label = $(`label[data-id="${topParentId}"]`);
                        $label.css({
                            'left': position.x + 'px',
                            'top': position.y + 'px'
                        });
                    }
                
                    // Using the updateIcons method after setting the position
                    this.updateIcons();
                }
                
                
            }
            
    
            getChildren(icon.dbId, icon.dbId);
        }
    }
    
    
    getModifiedWorldBoundingBox(dbId) {
        var fragList = this.viewer.model.getFragmentList();
        const nodebBox = new THREE.Box3();
    
        // 為每個fragId獲取邊界框
        for (const fragId of this._frags['dbId' + dbId]) {
            const fragbBox = new THREE.Box3();
            fragList.getWorldBounds(fragId, fragbBox);
            nodebBox.union(fragbBox); 
        }
    
        // 檢查MeshDictionary以獲取聚合模型的邊界框
        if (MeshDictionary[dbId]) {
            const aggregateMesh = MeshDictionary[dbId];
            const meshBox = new THREE.Box3().setFromObject(aggregateMesh);
            nodebBox.union(meshBox);
        }
    
        return nodebBox;
    }   
    



    // 根據元素的位置更新圖標的位置
    updateIcons() {
        for (const label of $('#' + this.viewer.clientContainer.id + ' div.adsk-viewing-viewer .update')) {
            const $label = $(label);
            const id = $label.data('id');
            console.log($label)
            // get the center of the dbId (based on its fragIds bounding boxes)
            const pos = this.viewer.worldToClient(this.getModifiedWorldBoundingBox(id).center());
            console.log(pos);
            // position the label center to it
            $label.css('left', Math.floor(pos.x - $label[0].offsetWidth / 2) + 'px');
            $label.css('top', Math.floor(pos.y - $label[0].offsetHeight / 2) + 'px');
            $label.css('display', this.viewer.isNodeVisible(id) ? 'block' : 'none');
        }    
    }
}

// 在 Autodesk.Viewing 中註冊這個擴展
Autodesk.Viewing.theExtensionManager.registerExtension('IconMarkupExtension', IconMarkupExtension);
