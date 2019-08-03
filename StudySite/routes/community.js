const express = require('express');
const { isLoggedIn } = require('./middlewares');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const { User, Post, Community } = require('../models');

fs.readdir('uploads', (error) => {
    if(error) {
        console.error('Uploads directory is not existed');
        fs.mkdirSync('uploads');
    }
});

const upload = multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, 'uploads/');
      },
      filename: function (req, file, cb) {
        cb(null, new Date().valueOf() + path.extname(file.originalname));
      }
    }),
  });

router.get('/community_create', isLoggedIn, (req, res, next) => {
    res.render('community_create', {
        title: 'community create',
        user: req.user,
        createError: req.flash('createError')
    });
});

router.post('/community_create', isLoggedIn, upload.array('img', 10), async (req, res, next) => {
    try {

        const exCommunity = await Community.findOne({ where: { title_url: req.body.title_url } })

        if(exCommunity) {
            req.flash('createError', 'This Community is alreday created');
            res.redirect('/community_create');
        }

        console.log(req.files);


        let img_logo = null;
        if(req.files[0]) {
            img_logo = req.files[0].filename;
        }

        let img_background = null;
        if(req.files[1]) {
            img_background = req.files[1].filename
        }

        const community = await Community.create({
            title: req.body.title,
            title_url: req.body.title_url.toLowerCase(),
            img_logo: img_logo,
            img_background: img_background,
            bar_color: req.body.color,
            userId: req.user.id
        });

        res.redirect('/community/' + community.title_url);

    } catch(error) {
        console.error(error);
        return next(error);
    }
});

router.get('/:title_url', async(req, res, next) => {
    try {
        const community = await Community.findOne({
            include: {
                model: User,
                attributes:['id', 'nickname']
            },
            where: { title_url: req.params.title_url }
        });
        const posts = await Post.findAll({
            include: {
                model: User,
                attributes: ['id', 'nickname'],
                as: 'author'
            },
            where: { communityId: community.id }
        });

        res.render('community_template', {
            title: community.title,
            user: req.user,
            community: community,
            posts: posts,
            communityError: req.flash('communityError')
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get('/:title_url/setting', isLoggedIn, async(req, res, next) => {
    try {
        const community = await Community.findOne({
            include: {
                model: User,
            },
            where: { title_url: req.params.title_url }
        });

        if(community.userId != req.user.id) {
            req.flash('communityError', 'You are not allowed to access this page');
            return redirect('/community/:' + community.title_url);
        }

        res.render('community_setting', {
            title: community.title,
            user: req.user,
            community: community,
            communityError: req.flash('communityError')
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get('/:title_url/setting/delete', isLoggedIn, async(req, res, next) => {
    try {
        const community = await Community.findOne({
            include: {
                model: User,
            },
            where: { title_url: req.params.title_url }
        });

        if(!community) {
            req.flash('error', 'Invalid Access, please check url');
            return redirect('/');
        }

        if(community.userId != req.user.id) {
            req.flash('communityError', 'You are not allowed to access this page');
            return redirect('/community/:' + community.title_url);
        }

        await Community.destroy({
            where: { id: community.id }
        });
        return res.redirect('/');
    } catch (error) {
        console.error(error);
        next(error);
    }
});

/* Change a manager of community */
router.put('/:title_url/setting', isLoggedIn, async(req, res, next) => {
    try {
        const user = await User.findOne({
            where: { email: req.body.email }
        });

        let result;
        if(user) {
            await Community.update(
                { userId: user.id },
                { where: { title_url: req.params.title_url } }
            );
            result = 'Successfully changed';
        } else {
            result = 'Email is wrong!';
        }

        res.json({ result: result });
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

module.exports = router;