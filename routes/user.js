const { Router } = require('express');
const router = Router();

const User = require('../models/user');

const path = require('path');
const multer  = require('multer');
// const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve('./public/users'));
    },
    filename: function (req, file, cb) {
      const fileName = `${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    }
});

const upload = multer({ storage: storage });
  
//GET
router.get('/login', (req, res) =>{
    return res.render('login');
});

router.get('/signup', (req, res) =>{
    return res.render('signup');
});

router.get('/logout', (req, res) => {
    return res.clearCookie('token').redirect('/');
});

router.get('/profile/:id', async (req, res) => {
    const users = await User.findById(req.params.id);
    return res.render('userProfile', {
        users,
        user: req.user,
    });
});

router.get('/update-profile/:id', async (req, res) => {
    const user = await User.findById(req.params.id);
    return res.render('updateProfile', {
        user,
    });
});

//POST
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try{
        const token = await User.matchPasswordAndGenerateToken(email, password);
        return res.cookie('token', token).redirect("/");
    } catch (error) {
        return res.render('login', {
            error: "Incorrect Email or Password!"
        });
    }
});

router.post('/signup', upload.single('profileImage'), async (req, res) =>{
    const { fullName, email, password } = req.body;

    if (!req.file) {
        await User.create({
            fullName,
            email,
            password,
        });
        const token = await User.matchPasswordAndGenerateToken(email, password);
        return res.cookie('token', token).redirect("/");
    }

    await User.create({
        fullName,
        email,
        password,
        profileImageURL: `/users/${req.file.filename}`,
    });
    const token = await User.matchPasswordAndGenerateToken(email, password);
    return res.cookie('token', token).redirect("/");
});

//UPDATE
router.post('/update-profile/:id', upload.single('profileImage'), async (req, res) => {
    const { fullName, email } = req.body;
    if (!req.file) {
        await User.findByIdAndUpdate(req.params.id, { 
            fullName, 
            email, 
        }, { new: true, runValidators: true });
        return res.redirect(`/user/profile/${req.params.id}`);
    }
    await User.findByIdAndUpdate(req.params.id, { 
        fullName, 
        email, 
        profileImageURL: `/users/${req.file.filename}`,
    }, { new: true, runValidators: true });
    return res.redirect(`/user/profile/${req.params.id}`);
});

module.exports = router;
