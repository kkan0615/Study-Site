const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { isLoggedIn } = require('./middlewares');
const router = express.Router();
const { User, Post, Community, Comment } = require('../models');;


fs.readdir('uploads', (error) => {
    if(error) {
        console.error('Uploads directory is not existed');
        fs.mkdirSync('uploads');
    }
});

const upload = multer({
    storage: multer.diskStorage({
        destination: function(req, file, callback) {
            callback(null, 'uploads/');
        },
        filename: function(req, file, callback) {
            const ext = path.extname(file.originalname);
            callback(null, path.basename(file.originalname, ext) + new Date().valueOf() + ext);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
});

router.get('/:title_url/write', isLoggedIn, async (req, res, next) => {
    try {
        const community = await Community.findOne({
            include: {
                model: User,
                attributes: ['id', 'nickname'],
            },
            where: { title_url: req.params.title_url }
        });


        res.render('post_write', {
            title: community.title,
            user: req.user,
            community: community,
            postError: req.flash('Post error!')
        });

    } catch (error) {
        console.error(error);
        return next(next);
    }
});

router.post('/:title_url/write', isLoggedIn, upload.single('img'), async (req, res, next) => {
    console.log(req.files);
    try {

        if(!req.body.title) {
            return res.redirect('/post/'+req.params.title_url+'/write');
        }

        if(!req.body.content) {
            return res.redirect('/post/'+req.params.title_url+'/write');
        }
        const community = await Community.findOne({
            include: {
                model: User,
                attributes: ['id', 'nickname'],
            },
            where: { title_url: req.params.title_url }
        });

        if(!community) {
            return res.redirect('/post/'+req.params.title_url+'/write');
        }

        const post = await Post.create({
            title: req.body.title,
            content: req.body.content,
            img : req.file.path,
            communityId: community.id,
            authorId: req.user.id
        });

        return res.redirect('/post/' + post.id);

    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.get('/:id', async(req, res, next) => {
    try {
        const post = await Post.findOne({
            include: [ {
                model: User,
                attributes: ['id', 'nickname'],
                as: 'author'
            },
            {
                model: Community
            }],
            where: { id: req.params.id }
        });
        if(!post) {
            return res.redirect('/');
        }

        const community = await Community.findOne({
            include: {
                model: User,
                attributes: ['id', 'nickname'],
            },
            where: { id: post.communityId }
        });

        if(!community) {
            return res.redirect('/');
        }

        const comments = await Comment.findAll({
            include: {
                model: User,
            },
            where: { postId: req.params.id}
        });

        res.render('post_template', {
            title: post.title,
            user: req.user,
            community: community,
            post: post,
            comments: comments,
            communityError: null
        });

    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.delete('/:id', isLoggedIn, async(req, res, next) => {
    try {
        const post = await Post.findOne({
            include: {
                model: User,
                as: 'author'
            },
            where :{ id: req.params.id }
        });

        if(!post) {
            return res.json({result: 'Post is not deleted'});
        }

        const community = await Community.findOne({
            where : {id: post.communityId }
        });

        if(!community) {
            return res.json({result: 'Post is not deleted'});
        }

        if(post.authorId == req.user.id || community.user.id == req.user.id) {
            await Post.destroy({
                include: {
                    model: User,
                    as: 'author'
                },
                where: { id: req.params.id }
            });
            //res.redirect('/community'+community.title_url);
            res.json({result: 'Post is deleted successfully'});
        } else {
            res.json({result: 'Post is not deleted'});
        }
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

module.exports = router;