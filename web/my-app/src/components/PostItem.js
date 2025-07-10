import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

/**
 * PostItem Component
 * Displays individual post with delete functionality for admins
 */
function PostItem({ post, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const { hasRole, getAuthHeader } = useAuth();
  
  const isAdmin = hasRole('admin');

  const handleDelete = async () => {
    if (!isAdmin || deleting || deleted) return;
    
    const confirmed = window.confirm(`Delete this post by ${post.authorName}?\n\n"${post.content.substring(0, 50)}..."`);
    if (!confirmed) return;

    setDeleting(true);
    
    try {
      const response = await fetch(`http://localhost:4000/api/posts/${post.id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete post');
      }

      const result = await response.json();
      console.log('Post deleted:', result);
      
      setDeleted(true);
      
      // Notify parent component
      if (onDelete) {
        onDelete(post.id);
      }
      
    } catch (error) {
      console.error('Delete error:', error);
      alert(`Failed to delete post: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (deleted) {
    return (
      <div >
        <div>
          ✅ Post deleted successfully
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <div>
          <div>
            {post.authorName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div>{post.authorName}</div>
            <div>
              {formatDate(post.created)}
            </div>
          </div>
        </div>
        
        {isAdmin && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            
            title="Delete post (Admin only)"
          >
            {deleting ? '🔄' : '🗑️'}
          </button>
        )}
      </div>
      
      <div>
        {post.content}
      </div>
      
      <div>
        <span>
          ❤️ {post.likes || 0}
        </span>
        <span>
          💬 {post.comments || 0}
        </span>
        <span>
          ID: {post.id}
        </span>
      </div>
    </div>
  );
}