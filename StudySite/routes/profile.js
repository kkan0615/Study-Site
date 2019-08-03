const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();
const { User, Post, Community, Comment, Program } = require('../models');

//Request : 얻어 오는것 Response: 내보내는것
//My information page
router.get('/:id', isLoggedIn, async (req, res, next) => {
    try {
        const user = await User.findOne({
            include: [{
                model: Post,
            }, {
                model: Community,
            }, {
                model: Program,
            }, {
                model: Comment,
            }],
            where: { id: req.params.id }
        });

        if(user.id != req.user.id) {
            req.flash('You are not allowed to access')
            return res.redirect('/');
        }

        user.posts = await Post.findAll({
            where: { authorId: user.id }
        });

        user.programs = await Program.findAll({
            where: { authorId: user.id }
        });

        console.log(user);
        res.render('profile', {
            title : 'My Information',
            user: user,
        });

    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.get('/:id/posts', isLoggedIn, async(req, res, next) => {
    try {
        const user = await User.findOne({
            include: [{
                model: Post
            }, {
                model: Community
            }],
            where: { id: req.params.id }
        });

        if(user.id != req.user.id) {
            return res.redirect('/');
        }
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

module.exports = router;