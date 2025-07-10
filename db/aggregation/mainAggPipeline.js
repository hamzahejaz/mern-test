function getUserFeed(userId) {
	return [
		{
			$match: {
				follower: userId,
			},
		},
		{
			$lookup: {
				from: "posts",
				localField: "following",
				foreignField: "author",
				as: "posts",
			},
		},
		{
			$unwind: "$posts",
		},
		{
			$lookup: {
				from: "users",
				localField: "posts.author",
				foreignField: "_id",
				as: "authorInfo",
			},
		},
		{
			$unwind: "$authorInfo",
		},
		{
			$project: {
				_id: "$posts._id",
				postId: "$posts._id",
				content: "$posts.content",
				authorId: "$authorInfo._id",
				authorName: "$authorInfo.name",
				createdAt: "$posts.createdAt",
			},
		},
		{
			$sort: { createdAt: -1 },
		},
		{
			$limit: 20,
		},
	];
}

const sampleData = {
	users: [
		{ _id: "u1", name: "User One" },
		{ _id: "u2", name: "User Two" },
		{ _id: "u3", name: "User Three" },
	],

	follows: [
		{ follower: "u1", following: "u2" },
		{ follower: "u1", following: "u3" },
		{ follower: "u2", following: "u3" },
	],
	posts: [
		{
			_id: "p1",
			author: "u2",
			content: "Post by User Two - 1",
			createdAt: new Date("2024-07-01T10:00:00Z"),
		},
		{
			_id: "p2",
			author: "u3",
			content: "Post by User Three - 1",
			createdAt: new Date("2024-07-02T12:00:00Z"),
		},
		{
			_id: "p3",
			author: "u2",
			content: "Post by User Two - 2",
			createdAt: new Date("2024-07-03T14:00:00Z"),
		},
	],
};

export default {
	getUserFeed,
	sampleData,
};
