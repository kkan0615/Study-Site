const express = require('express');
const multer = require('multer');
const path = require('path');
const { isLoggedIn } = require('./middlewares');
const router = express.Router();
const { User, Program, Chapter, Subject, Subject_comment, Code  } = require('../models');;

router.get('/list', async (req, res, next) => {
    try {
        const order = req.query.order;
        let orderArr = [];
        if(order == 'title_DESC') {
            orderArr['standard'] = 'title';
            orderArr['order'] = 'DESC';
        } else if(order == 'title_asc') {
            orderArr['standard'] = 'title';
            orderArr['order']= 'ASC';
        } else {
            orderArr['standard'] = 'createdAt';
            orderArr['order']= 'DESC';
        }

        let programs = [];
        const codeQuery = req.query.code;
        if(codeQuery) {
            const code = await Code.findOne({
                where: { id: codeQuery }
            });
            programs = await code.getPrograms({
                include: [{
                    model: User,
                    as: 'author',
                }],
                order: [[orderArr.standard, orderArr.order]],
            });
        } else {
            programs = await Program.findAll({
                include: [{
                    model: User,
                    as: 'author',
                }, {
                    model: Code,
                }],
                order: [[orderArr.standard, orderArr.order]],
            });
        }

        const codes = await Code.findAll({
            attributes:['id', 'name'],
            order: [['name', 'DESC']],
        });

        return res.render('program_list', {
            title:'Program list',
            user: req.user,
            programs: programs,
            codes: codes
        });
    } catch (error) {
        console.error(error);
        return next(error);
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

router.get('/write', isLoggedIn, async(req, res, next) => {
    try {
        const codes = await Code.findAll({
            attributes:['id', 'name'],
        });

        return res.render('program_write', {
            title:'Program write',
            user: req.user,
            codes: codes
        });
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.post('/write', isLoggedIn, upload.single('img'), async(req, res, next) => {
    try {
        const exProgram = await Program.findOne({
            where: {url_key: req.body.url_key}
        });

        if( exProgram ){
            req.flash('program is already existed')
            return res.redirect('/program/' + exProgram.url_key);
        }

        const exCode = await Code.findOne({
            where: { id: req.body.code }
        });

        if (!exCode) {
            req.flash('Code is not existed');
            return res.redirect('/program/' + write);
        }

        const program = await Program.create({
            cover: req.file.filename,
            title: req.body.title,
            introduction: req.body.introduction,
            url_key: req.body.url_key,
            authorId: req.user.id,
        });
        if(req.body.code.length > 1 ) {
            req.body.code.forEach(code => {
                program.addCode(code);
            });
        } else {
            program.addCode(req.body.code);
        }

        return res.redirect('/program/' + program.url_key);
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.get('/:url_key', async(req, res, next) => {
    try {
        const program = await Program.findOne({
            include: [{
                model: User,
                as: 'author',
            }, {
                model: Chapter,
            }, {
                model: Subject,
            }, {
                model: Subject_comment,
            }, {
                model: Code,
            }],
            where: {url_key: req.params.url_key}
        });

        if(!program) {
            return res.redirect('/');
        }

        return res.render('program_detail', {
            title: program.title,
            user: req.user,
            program: program
        });
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.get('/:url_key/chapter/create', isLoggedIn, async(req, res, next) => {
    try {
        const program = await Program.findOne({
            include: [{
                model: User,
                as: 'author',
            }, {
                model: Chapter,
            }, {
                model: Subject,
            }, {
                model: Subject_comment,
            }],
            where: {url_key: req.params.url_key}
        });

        //if there is no program
        if(!program) {
            return res.redirect('/');
        }

        return res.render('program_chapter_create', {
            title: program.title,
            user: req.user,
            program: program
        });

    } catch (error) {
        console.error(error);
        return next(error);

    }
});

router.post('/:url_key/chapter/create', isLoggedIn, async(req, res, next) => {
    try {
        const program = await Program.findOne({
            include: [{
                model: User,
                as: 'author',
            }, {
                model: Chapter,
                include: {
                    model: Subject,
                }
            }, {
                model: Subject,
            }, {
                model: Subject_comment,
            }],
            where: {url_key: req.params.url_key}
        });

        //if there is no program
        if(!program) {
            return res.redirect('/');
        }

        //if author is not this user
        if(req.user.id != program.authorId) {
            return res.redirect('/program/'+req.params.url_key);
        }

        await Chapter.create({
            title: req.body.title,
            number: req.body.number,
            programId: program.id
        });

        return res.redirect('/program/'+req.params.url_key);

    } catch (error) {
        console.error(error);
        return next(error);

    }
});

router.get('/:url_key/:id/subject/create', isLoggedIn, async(req, res, next) => {
    try {
        const program = await Program.findOne({
            include: [{
                model: User,
                as: 'author',
            }, {
                model: Chapter,
            }, {
                model: Subject,
            }, {
                model: Subject_comment,
            }],
            where: {url_key: req.params.url_key}
        });

        return res.render( 'subject_write', {
            title: 'subject_write',
            user: req.user,
            program: program
        });
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.post('/:url_key/:id/subject/create', isLoggedIn, async(req, res, next) => {
    try {
        const program = await Program.findOne({
            include: [{
                model: User,
                as: 'author',
            }, {
                model: Chapter,
            }, {
                model: Subject,
            }, {
                model: Subject_comment,
            }],
            where: {url_key: req.params.url_key}
        });

        //if there is no program
        if(!program) {
            req.flash('invalid access');
            return res.redirect('/');
        }

        //if author is not this user
        if(req.user.id != program.authorId) {
            req.flash('You do not have permission')
            return res.redirect('program/'+req.params.url_key);
        }

        const chapter = await Chapter.findOne({
            where: { id: req.params.id, programId: program.id }
        });

        if(!chapter) {
            req.flash('There is no this chapter you asked');
            return res.redirect('program/'+program.url_key);
        }

        await Subject.create({
            title: req.body.title,
            content: req.body.content,
            programId: program.id,
            chapterId: chapter.id,
        });

        return res.redirect('/program/'+program.url_key);
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.get('/:url_key/subject/:id', async(req, res, next) => {
    try {
        const program = await Program.findOne({
            include: [{
                model: User,
                as: 'author',
            }, {
                model: Chapter,
            }, {
                model: Subject,
            }, {
                model: Subject_comment,
            }],
            where: {url_key: req.params.url_key}
        });

        const subject = await Subject.findOne({
            include: [{
                model: Program,
            }],
            where: { id: req.params.id }
        });

        return res.render('subject_detail', {
            title: program.title,
            user: req.user,
            program: program,
            subject: subject
        });
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

module.exports = router;