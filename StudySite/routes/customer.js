const express = require('express');
const multer = require('multer');
const path = require('path');
const { isAdmain , isLoggedIn } = require('./middlewares');
const router = express.Router();
const { User, Room, Chat } = require('../models');;

router.get('/', async (req, res, next) => {
    try {

        return res.render('customer', {
            title: 'costomer center',
            user: req.user
         });
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const room = await Room.create({
            name: req.body.name,
        });

        return res.redirect('/customer/room/'+room.id);
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.get('/adminManager', isAdmain, isLoggedIn, async (req, res, next) => {
    try {
        const rooms = await Room.findAll({
            incldue: {
                model: User,
            },
        });

        return res.render('adminManager', {
            title: 'costomer admin',
            user: req.user,
            rooms: rooms
         });
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.get('/room/:id', async(req, res, next) => {
    try {
        const room = await Room.findOne({
            where: { id: req.params.id }
        });

        if(!room) {
            res.send('Invalid');
            return res.redirect('customer/adminManager')
        }

        if(req.user && req.user.isAdmain == true) {
            room = await Room.update({
                userId: req.user.id,
            });
        }
        const chats = await Chat.findAll({
            incldue: {
                model: Room,
            },
            where : { roomId: room.id}
        });

        return res.render('room', {
            title: 'Chat !',
            user: req.user,
            room: room,
            chats: chats
         });
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.delete('/room/:id', async (req, res, next) => {
    try {
        await Room.destroy({ where: { id: req.params.id } });
        await Room.destroy({ where: { id: req.params.id } });
        res.send('ok');
        setTimeout( () => {
            req.app.get('io').of('/room').emit('removeRoom', req.params.id);
        }, 2000);
    } catch (error) {
        console.error(error);
        next(error);
    }
  });

router.post('/room/:id/chat', async (req, res, next) => {
    try {

        const room = await Room.findOne({
            where: { id: req.params.id }
        });

        let chat;
        // 미래에는 이 부분을 바꾸면 로그인한 사람도 질문 씹가능해짐 ㅋ
        if(req.user && req.user.isAdmin == true) {
            chat = await Chat.create({
                customer: 'Manager',
                content: req.body.chat,
                userId: req.user.id,
                roomId: room.id,
            });
        } else {
            const customer = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            chat = await Chat.create({
                customer: customer,
                roomId: room.id,
                content: req.body.chat,
                userId: null,
            });
        }

        req.app.get('io').of('/chat').to(room.id).emit('chat', chat);
        res.send('ok!');
    } catch (error) {
        console.error(error);
        return next(error);

    }
});

module.exports = router;