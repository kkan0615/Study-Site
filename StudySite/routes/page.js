const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();
const { User, Post, Community } = require('../models');

//Request : 얻어 오는것 Response: 내보내는것
//My information page
router.get('/profile', isLoggedIn, (req, res, next) => {
    res.render('profile', {
        title : 'My Information',
        user: req.user,
    });
});

//Register Page
router.get('/join', isNotLoggedIn, (req, res, next) => {
    res.render('join', {
        title: 'Registeration page',
        user: req.user,
        joinError: req.flash('joinError'),
    });
});

router.get('/login', isNotLoggedIn, (req, res, next) => {
    res.render('login', {
        title: 'Login Page',
        user: req.user,
        loginError: req.flash('loginError')
    });
});

router.get('/post_list', async (req, res, next) => {
    try {
        const order = req.query.order;
        let posts;
        if(order == 'title_DESC') {
            posts = await Post.findAll({
                include: {
                    model: User,
                    as:'author'
                },
                order: [['title', 'DESC']],
            });
        } else if(order == 'title_asc') {
            posts = await Post.findAll({
                include: {
                    model: User,
                    as:'author'
                },
                order: [['title', 'ASC']],
            });
        }
        else {
            posts = await Post.findAll({
                include: {
                    model: User,
                    as:'author'
                },
                order: [['createdAt', 'DESC']],
            });
        }

        res.render('post_list', {
            title: 'post list',
            user: req.user,
            list: posts,
            listError: req.flash('List Error')
        });
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.get('/community_list', async (req, res, next) => {
    try {
        const order = req.query.order;

        let communities
        if(order == 'create_date') {
            communities = await Community.findAll({
                attributes:['title', 'title_url'],
                order: [ ['createdAt', 'DESC' ] ]
            });
        } else if(order == 'title_asc') {
            communities = await Community.findAll({
                attributes:['title', 'title_url'],
                order: [ ['title', 'ASC' ] ]
            });
        }
        else {
            communities = await Community.findAll({
                attributes:['title', 'title_url'],
                order: [ ['title', 'DESC' ] ]
            });
        }

        res.render('community_list', {
            title: 'community_list',
            user: req.user,
            communities: communities,
            listError: req.flash('List error!')
        });

    } catch(error) {
        console.error(error);
        return next(error);
    }
});

//Main page
router.get('/', (req, res, next) => {
    res.render('main', {
        title: 'Hello!',
        user: req.user,
        loginError: req.flash('loginError'),
    });
});

module.exports = router;