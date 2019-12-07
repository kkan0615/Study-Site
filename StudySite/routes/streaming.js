const express = require('express');
const router = express.Router();
const fs = require('fs');
const { isLoggedIn } = require('./middlewares');
const { Subject } = require('../models');;

/* Play a steam of video */
/* https://medium.com/better-programming/video-stream-with-node-js-and-html5-320b3191a6b6 */
router.get('/video/:id', async(req, res, next) => {
    try {
        const subject = await Subject.findOne({
            where: { id: req.params.id }
        });

        if(!subject) {
            req.flash('error', 'Subject can not be found');
            return res.redirect('/');
        }

        const path = 'uploads/' + subject.video;
        const stat = fs.statSync(path);
        const fileSize = stat.size;
        const range = req.headers.range;

        if(range) {
            const parts = range.replace(/bytes=/, '').split('_');
            const start = parseInt(parts[0], 10);
            const end = parts[1]
            ? parseInt(parts[1], 10)
            : fileSize - 1;
            const chunckSize = (end - start) + 1;
            const file = fs.createReadStream(path, { start, end }); //Create read Steam
            const contentRange = 'bytes '+start +'-'+end+'/'+fileSize
            const head = {
                //bytes 1572864-17839844/17839845
                //`bytes ${start}-${end}/${fileSize}`
                'Content-Range': contentRange,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunckSize,
                'Content-Type': 'video/mp4',
            }
            res.writeHead(206, head);
            console.log(head);

            file.pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            }
            res.writeHead(200, head);
            fs.createReadStream(path).pipe(res);
        }
        } catch (error) {
            console.error(error);
            next(error)
        }
});

module.exports = router;