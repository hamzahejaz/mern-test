const userSchema = {
  _id:"ObjectId",
  name: "String",
  joined: "Date",

  stats:{
    followersCount: "Number",
    followingCount: "Number",
    postsCount: "Number",
    likesCount: "Number",
    commentsCount: "Number",
    sharesCount: "Number",
    viewsCount: "Number",   
  }
}

const followSchema = {
  _id: "ObjectId",
  follower: "ObjectId",
  following: "ObjectId",
  createdAt: "Date"
}

const postSchema = {
  _id: "ObjectId",
  author:"String",
  content: "String",
  created:"Date",
  authorName: "String",
  likes:"Number",
  comments:"Number",
}

const indexs = {
    users:[
        {_id: 1, key: "name", unique: true },
        {name:"text"}
    ],

    follows:[
        {follower: 1, following: 1 },
        {follower: 1, createdAt: -1 },
        {following: 1, createdAt: -1 },

    ],

    posts:[
        {created:-1},
        {author:1, created:-1},
        {authorName:"text",},  
    ]
}

module.exports = {
  userSchema,
  followSchema,
  postSchema,
  indexs
};