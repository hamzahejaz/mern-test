import express from 'express';
import jwt from 'jsonwebtoken';

const USERS =[
    { id:"u1",role:"user",name:"User One", password:"password1" },
    { id:"u2",role:"admin",name:"User Two", password:"password2"}
]

router.post ('/login', (req, res) => {
    try {
        const { id, password } = req.body;
        if(!id || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        const user = USERS.find(u => u.id === id && u.password === password);
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        if(user.password !== password) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        const payload ={
            id:user.id,
            role: user.role,
            name: user.name,
            iat:Math.floor(Date.now() / 1000)
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' });

        res.json({
            token,
            user: {
                id: user.id,
                role: user.role,
                name: user.name
            }
        })
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Authentication failed' });
    }
})

router.get('/me', (req, res) => {
    try {
const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid token' });
            }
            const user = USERS.find(u => u.id === decoded.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json({
                id: user.id,
                role: user.role,
                name: user.name
            });
        });         
    } catch (error) {
        console.error('Me endpoint:', error);
        res.status(500).json({ message: 'Logout failed' });
    }
})

module.exports = router;