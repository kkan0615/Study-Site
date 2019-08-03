const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();
const { User, Post, Comment, Community } = require('../models');

router.get('/:id', async(req, res, next) => {
    const comments = await Comment.findAll({
        include: {
            model: User,
        },
        where:{ postId: req.params.id }
    });

    res.json({ comments: comments });
});

router.post('/:id', isLoggedIn, async(req, res, next) => {
    try {
        const comment = await Comment.create({
            conetent: req.body.content,
            img: null,
            postId: req.params.id,
            userId: req.user.id
        });
        return res.redirect('/post/' + comment.postId);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.delete('/:id', isLoggedIn,  async(req, res, next) => {
    try {
        const comment = await Comment.findOne({
            include: {
                model: Post
            },
            where: { id: req.params.id }
        });

        const community = await Community.findOne({
            include: {
                model: User,
            },
            where: { id: comment.post.communityId }
        });

        let message
        if(comment.userId == req.user.id || req.user.id == community.user.id) {
            await Comment.destroy({
                include: {
                    model: User,
                },
                where: { id: req.params.id }
            });
            message = 'Comment is deleted';
        }
        else {
            message = 'Access denided';
        }

        return res.json({ message: message } );
    } catch(error) {
        console.error(error);
        next(error);
    }
});

router.patch('/:id', isLoggedIn, async(req, res, next) => {

});

module.exports = router;