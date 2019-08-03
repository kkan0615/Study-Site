const express = require('express');
const cookieParser = require('cookie-parser')
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
require('dotenv').config();
const { sequelize } = require('./models');
const passportConfig = require('./passport');
const pageRouter = require('./routes/page');
const authRouter = require('./routes/auth');
const communityRouter = require('./routes/community');
const postRouter = require('./routes/post');
const commentRouter = require('./routes/comment');
const porfileRouter = require('./routes/profile');
const programRotuer = require('./routes/program');
const webSocket = require('./socket');
const customerRouter = require('./routes/customer');

const app = express();
sequelize.sync();

const sessionMiddleware = session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  });

passportConfig(passport);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 8001);

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(sessionMiddleware);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use('/', pageRouter);
app.use('/auth', authRouter);
app.use('/community', communityRouter);
app.use('/post', postRouter);
app.use('/comment', commentRouter);
app.use('/uploads', express.static('uploads'));
app.use('/profile', porfileRouter);
app.use('/program', programRotuer);
app.use('/customer', customerRouter);

const server = app.listen(app.get('port'), () => {
    console.log(app.get('port'), 'is wating you!');
  });

webSocket(server, app, sessionMiddleware);