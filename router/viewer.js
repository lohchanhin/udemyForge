const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/:urn', (req, res) => {
    const { urn } = req.params;

    switch (urn) {
        case '1':
            res.sendFile(path.join(__dirname, '../public/page/view1.html'));
            break;
        case '2':
            res.sendFile(path.join(__dirname, '../public/page/view2.html'));
            break;
        case '3':
            res.sendFile(path.join(__dirname, '../public/page/view3.html'));
            break;
        default:
            res.status(404).send('Page not found');
            break;
    }
});

module.exports = router;
