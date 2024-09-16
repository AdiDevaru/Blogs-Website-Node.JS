require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const userRoute = require('./routes/user');
const blogRoute = require('./routes/blog');
// const commentRoute = require('./routes/comment');

const { connectMongoDB } = require('./connection');
const { checkCookie } = require('./middlewares/authentication');

const Blog = require('./models/blog');
const User = require('./models/user');

app = express();
const PORT = process.env.PORT;

//mongodb://localhost:27017/blog-app
connectMongoDB(process.env.MONGO_URL)
  .then(e => console.log('MonogoDB Connected'));

app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(checkCookie("token"));
app.use(express.static(path.resolve('./public')));

app.get('/', async (req, res) => {
    const allBlogs = await Blog.find({});
    res.render('home', {
        user: req.user,
        blogs: allBlogs,
    });
});

app.use('/user', userRoute);
app.use('/blog', blogRoute);

app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));
