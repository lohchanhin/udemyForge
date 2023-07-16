const express = require("express")
const app = express();

const viewerRouter = require('./router/viewer');

app.use(express.static('public'));
app.use('/viewer',viewerRouter);

app.listen(3000,()=>{
    console.log('Server is running on port 3000');
});