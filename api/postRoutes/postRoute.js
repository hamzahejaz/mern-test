import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

let MOCK_POSTS = []

function GENERATEMOCKPOSTS() {
    const posts =[]
    const authors =[
        { id:"u1",name:"User One" },
        { id:"u2",name:"User Two"}
    ]
}


const SAMPLE_CONTENT = [
    "Just finished an awesome coding session! 💻🔥",
    "Anyone else struggling with async/await? 😩",
    "Learning Node.js has been a game-changer for me!",
    "Coffee + Code = Productivity ☕️💡",
    "Deploying my first app today, wish me luck! 🚀",
    "Finally understood how JWT works. Security is key! 🔐",
    "What’s your favorite VS Code extension?",
    "Trying out Express middleware — pretty powerful stuff!",
    "Debugging is like being a detective in a crime movie 🕵️‍♂️",
    "Just pushed a new update to GitHub, check it out! 🔄"
  ];

  for (let i = 0; i < 10; i++) {
    const author = authors[Math.floor(Math.random() * authors.length)];
    const content = SAMPLE_CONTENT[Math.floor(Math.random() * SAMPLE_CONTENT.length)];
    const hoursAgo = Math.floor(Math.random() * 24);

    posts.push({
    id: `p${i + 1}`,
    author: author.id,
    authorName: author.name,
    content: content,
    createdAt: new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString(),
    likes: Math.floor(Math.random() * 100),
    comments: Math.floor(Math.random() * 50)
    
    })

    return posts.sorted((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  router.get('/feed', (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        if(page<1||limit<1||limit>50) {
            return res.status(400).json({ message: 'Invalid page or limit' });
        }
        const totalCount = MOCK_POSTS.length;
        const posts = MOCK_POSTS.slice(offset, offset + limit);
        const hasMore = totalCount > offset + limit;

        res.json({
            posts,
            totalCount,
            hasMore,
            currentPage:page,
            totalPages:Math.cell(totalCount/limit)
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Failed to fetch posts' });
    }
});


router.delete('/feed/:id',authorize(['admin']), (req, res) => {
    try {
        const {id} = req.params;

        if(!id){
            return res.status(400).json({ message: 'Post ID is required' });
        }
        const postIndex = MOCK_POSTS.findIndex(post => post.id === id);
        if(postIndex === -1) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const deletedPost = MOCK_POSTS.splice(postIndex, 1)[0];
        res.json({ message: 'Post deleted successfully', post: deletedPost ,
            deletedPost:{
                id:deletedPost.id,
                content:deletedPost.content,
                author:deletedPost.author,
            },
            deletedBy:req.user.name
        });          
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Failed to delete post' });
    }
});

router.get('/feed/:id', (req, res) => {
    try {
        const { id } = req.params;
        const posts = MOCK_POSTS.find(post => post.id === id);
        if(!posts) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(posts);    
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ message: 'Failed to fetch post' });
    }
});

router.get('/posts', (req, res) => {
    try {
        const posts = MOCK_POSTS;
        if(posts.length === 0) {
            return res.status(404).json({ message: 'No posts found' });
        }
        res.json({posts:MOCK_POSTS.slice(0, 10),totalCount:MOCK_POSTS.length});
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Failed to fetch posts' });
    }
});

module.exports = router;