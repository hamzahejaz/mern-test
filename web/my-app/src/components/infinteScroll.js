/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import useApi from "../hooks/useApi";

function Feed() {
	const [posts, setPosts] = useState([]);
	const [error, setError] = useState(null);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const observerRef = useRef();
	const lastPostElementRef = useRef(null);

	const { getCuurentUser, logout } = useAuth();
	const user = getCuurentUser();

	const {
		data: feedData,
		loading: initialLoading,
		error: err,
		refetch,
	} = useApi("feed", { params: { page: 1, limit: 10 } });

	useEffect(() => {
		if (feedData) {
			setPosts(feedData.posts || []);
			setPage(feedData.hasMore || false);
			setPage(1);
		}
	}, [feedData]);

	const loadMorePosts = useCallback(async () => {
		if (loadingMore || !hasMore) return;

		setLoadingMore(true);
		const nextPage = page + 1;

		try {
			const response = await fetch(
				`http://localhost:4000/api/posts?page=${nextPage}&limit=10`,
			);
			if (!response.ok) {
				throw new Error("Failed to load more posts");
			}

			const data = await response.json();

			if (data.posts && data.posts.length > 0) {
				setPosts((prevPosts) => {
					const existingIds = new Set(prevPosts.map((post) => post.id));
					const newPosts = data.posts.filter(
						(post) => !existingIds.has(post.id),
					);
					return [...prevPosts, ...newPosts];
				});
			}

			setHasMore(data.hasMore);
			setPage((prevPage) => prevPage + 1);
		} catch (error) {
			setError(error.message);
		} finally {
			setLoadingMore(false);
		}
	}, [page, hasMore, loadingMore]);

	useEffect(() => {
		const currentObserver = observerRef.current;
        if (currentObserver) { 
            currentObserver.disconnect();
         }

         observerRef.current = new IntersectionObserver(
            (entries) => {  
                if (entries[0].isIntersecting && hasMore && !loadingMore) {
                    loadMorePosts();
                }
            },
            {
                root: null, // Use the viewport as the root
                rootMargin: "0px",
                threshold: 1.0, // Trigger when 100% of the target is visible
            },
        );

        if (lastPostElementRef.current) {
            observerRef.current.observe(lastPostElementRef.current);
        }

		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
		};
	}, [lastPostElementRef, hasMore, loadingMore, loadMorePosts]);

    const handlePostDelete = (postId) => {
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    };
    const handleRefresh =  async () => {
        setPosts([]);
        setPage(1);
        setHasMore(true);
        setError(null);
        await refetch();
    }

    if (initialLoading) {
        return <div>Loading...</div>;
    }
    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Welcome, {user?.name || "User"}</h1>
                <button
                    onClick={logout}
                    className="text-sm text-red-500 hover:underline"
                >
                    Logout
                </button>
            </div>
    
            <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-medium">Your Feed</h2>
                <button
                    onClick={handleRefresh}
                    className="text-sm text-blue-500 hover:underline"
                >
                    Refresh
                </button>
            </div>
    
            {error && (
                <div className="text-red-600 mb-4">
                    ⚠️ {error}
                </div>
            )}
    
            {posts.length === 0 && !initialLoading && (
                <div className="text-gray-500 text-center py-8">No posts found.</div>
            )}
    
            <ul className="space-y-4">
                {posts.map((post, index) => {
                    const isLast = index === posts.length - 1;
                    return (
                        <li
                            key={post.id}
                            ref={isLast ? lastPostElementRef : null}
                            className="border rounded p-4 shadow"
                        >
                            <div className="text-sm text-gray-500 mb-1">
                                {new Date(post.createdAt).toLocaleString()}
                            </div>
                            <div className="font-medium text-gray-800 mb-2">
                                {post.authorName}
                            </div>
                            <p className="text-gray-700">{post.content}</p>
                        </li>
                    );
                })}
            </ul>
    
            {loadingMore && (
                <div className="text-center py-4 text-gray-500">Loading more posts...</div>
            )}
    
            {!hasMore && (
                <div className="text-center py-4 text-gray-400">No more posts.</div>
            )}
        </div>
    );
    
}
