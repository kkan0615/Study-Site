const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

const sequelize = new Sequelize(
  config.database, config.username, config.password, config,
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.User = require('./user')(sequelize, Sequelize);
db.Post = require('./post')(sequelize, Sequelize);
db.Comment = require('./comment')(sequelize, Sequelize);
db.Community = require('./community')(sequelize, Sequelize);
db.Code = require('./code')(sequelize, Sequelize);
db.Program = require('./program')(sequelize, Sequelize);
db.Chapter = require('./chapter')(sequelize, Sequelize);
db.Subject = require('./subject')(sequelize, Sequelize);
db.Subject_comment = require('./subject_comment')(sequelize, Sequelize);
db.Room = require('./room')(sequelize, Sequelize);
db.Chat = require('./chat')(sequelize, Sequelize);

//Community Manager
db.User.hasMany(db.Community);
db.Community.belongsTo(db.User);
//1:N Community : Post
db.Community.hasMany(db.Post);
db.Post.belongsTo(db.Community);
//1:N User : Post
db.User.hasMany(db.Post);
db.Post.belongsTo(db.User, {as: 'author'});
//1:N Post: Comment
db.Post.hasMany(db.Comment);
db.Comment.belongsTo(db.Post);
//comment
db.User.hasMany(db.Comment);
db.Comment.belongsTo(db.User);
//code 1:N program
db.Code.belongsToMany(db.Program, { through: 'CodeProgram' });
db.Program.belongsToMany(db.Code, { through: 'CodeProgram' });
//author 1:N program
db.User.hasMany(db.Program);
db.Program.belongsTo(db.User, {as: 'author'});
//Program 1:N Chapter
db.Program.hasMany(db.Chapter);
db.Chapter.belongsTo(db.Program);
//Program 1:N Subject
db.Program.hasMany(db.Subject);
db.Subject.belongsTo(db.Program);
//Program 1:N Subject_comment
db.Program.hasMany(db.Subject_comment);
db.Subject_comment.belongsTo(db.Program);
//Chapter 1:N subeject
db.Chapter.hasMany(db.Subject);
db.Subject.belongsTo(db.Chapter);
//subject 1:N subject_Comment
db.Subject.hasMany(db.Subject_comment);
db.Subject_comment.belongsTo(db.Subject);
// Manager 1:N Room as Manager
db.User.hasMany(db.Room);
db.Room.belongsTo(db.User)
// Manager 1:N Chat
db.User.hasMany(db.Chat);
db.Chat.belongsTo(db.User);
//
db.Room.hasMany(db.Chat);
db.Chat.belongsTo(db.Room);

module.exports = db;