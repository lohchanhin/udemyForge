const express = require("express");
const app = express();
const path = require("path"); // 你可能需要这个模块来处理路径问题

const viewerRouter = require('./router/viewer');

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')));

app.use('/viewer',viewerRouter);

app.listen(3000, ()=>{
    console.log('Server is running on port 3000');
});
