const { Schema, model } = require('mongoose');
const { createHmac, randomBytes } = require('crypto');
const { generateToken } = require('../services/authentication');

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    salt: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    profileImageURL: {
        type: String,
        default: '/images/defaultImage.jpg',
    },
    role: {
        type: String,
        enum: ['USER', 'ADMIN'],
        default: 'USER',
    },
}, {timestamps: true});

userSchema.pre('save', function (next) {
    const user = this;

    if (!user.isModified('password')) return;

    const salt = randomBytes(16).toString();
    const hashPassword = createHmac('sha256', salt).update(user.password).digest('hex');

    this.salt = salt;
    this.password = hashPassword;

    next();
});

userSchema.static ("matchPasswordAndGenerateToken", async function(email, password){ 
    const user = await this.findOne({email});
    if (!user) throw new Error("User not Found!");

    const salt = user.salt;
    const hashedPassword = user.password;

    const checkHashedPassword = createHmac('sha256', salt).update(password).digest('hex');

    if(checkHashedPassword !== hashedPassword) throw new Error("Incorrect Password");

    const token = generateToken(user);
    return token;
})

const User = model('user', userSchema);

module.exports = User;
