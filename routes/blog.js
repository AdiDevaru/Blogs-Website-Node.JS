const { Router } = require('express');
const router = Router();
const path = require('path');

const multer  = require('multer');

const Blog = require('../models/blog');
const User = require('../models/user');
const Comment = require('../models/comment');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve('./public/uploads'));
    },
    filename: function (req, file, cb) {
      const fileName = `${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    }
});
  
const upload = multer({ storage: storage });

//GET
router.get('/add-blog', (req, res) => {
    return res.render('addBlog', {
        user: req.user,
    });
});

router.get('/:id', async (req, res) => {
    const id = req.params.id;
    const currentBlog = await Blog.find({_id: id}).populate('author');
    const comment = await Comment.find({blogID: id}).populate('author');

    return res.render('blogPage', {
        blogs: currentBlog,
        user: req.user,
        comments: comment,
    });
});

router.get('/update-blog/:id', async (req, res) => {
    const blog = await Blog.findById(req.params.id).populate('author');
    return res.render('updateBlog', {
        blog,
        user: req.user,
    });
});

router.get('/update-comment/:id', async (req, res) => {
    const comment = await Comment.findById(req.params.id);
    return res.render('updateComment', {
        user: req.user,
        comment,
    });
});

//POST
router.post('/add-blog', upload.single('coverImage'), async (req, res) => {
    const {title, body} = req.body;
    
    if (!req.file) {
        const blog = await Blog.create({
            title,
            body,
            author: req.user._id,
        });
        return res.redirect(`/blog/${blog._id}`);

    }

    const blog = await Blog.create({
        title,
        body,
        author: req.user._id,
        coverImageURL: `/uploads/${req.file.filename}`,
    });

    return res.redirect(`/blog/${blog._id}`);
});

router.post('/comment/:blogID', async (req, res) => {
    await Comment.create({
        content: req.body.content,
        author: req.user._id,
        blogID: req.params.blogID,
    });
    return res.redirect(`/blog/${req.params.blogID}`);
});

//UPDATE
router.post('/update-blog/:id', upload.single('coverImage'), async (req, res) => {
    const { title, body } = req.body;
    if (!req.file) {
        await Blog.findByIdAndUpdate(req.params.id, {
            title,
            body,
        });
        return res.redirect(`/blog/${req.params.id}`);
    }
    await Blog.findByIdAndUpdate(req.params.id, {
        title,
        body,
        coverImageURL: `/uploads/${req.file.filename}`,
    });
    return res.redirect(`/blog/${req.params.id}`);
});

router.post('/update-comment/:id', async (req, res) => {
     const comment = await Comment.findByIdAndUpdate(req.params.id, {
        content: req.body.content,
    });
    return res.redirect(`/blog/${comment.blogID}`);
});

//DELETE
router.get('/delete-confirm/:id', async (req, res) => {
    const comment = await Comment.findById(req.params.id);
    const blog = await Blog.findById(comment.blogID);
    return res.render('confirmDeleteComment', {
        user: req.user,
        comment,
        blog,
    });
});

router.get('/delete-blog-confirm/:id', async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    const comments = await Comment.find({ blogID: blog._id });
    return res.render('confirmDeleteBlog', {
        user: req.user,
        blog,
        comments,
    });
});

router.get('/delete-comment/:id', async (req, res) => {
    const comment = await Comment.findById(req.params.id);
    const blogID = comment.blogID;

    await Comment.findByIdAndDelete(req.params.id);
    return res.redirect(`/blog/${blogID}`);
});

router.get('/delete-blog/:id', async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    
    await Comment.deleteMany({ blogID: blog._id });
    await Blog.findByIdAndDelete(req.params.id);
    return res.redirect('/');
});


module.exports = router;