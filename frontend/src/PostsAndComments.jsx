import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";

function PostsAndComments() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [newCommentContent, setNewCommentContent] = useState("");
  const { user } = useContext(UserContext);
  const [followStatus, setFollowStatus] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messageReceiverId, setMessageReceiverId] = useState(null);
  const [messageContent, setMessageContent] = useState("");

  // Fetch posts and comments for the thread
  useEffect(() => {
    axios
      .get(`http://localhost:8081/thread/${id}/posts`)
      .then((res) => {
        setPosts(res.data.posts);
        setComments(res.data.comments);
        // Initialize follow status for all users in posts and comments
        const userIds = new Set([
          ...res.data.posts.map((post) => post.post_user_id),
          ...res.data.comments.map((comment) => comment.comment_user_id),
        ]);
        userIds.forEach(checkFollowStatus);
      })
      .catch((err) => console.error("Error fetching posts and comments:", err));
  }, [id]);

  // Handle creating a new post
  const handleCreatePost = () => {
    if (!user) {
      alert("You must be logged in to create a post.");
      return;
    }
    if (!newPostContent) {
      alert("Post content cannot be empty.");
      return;
    }

    axios
      .post(`http://localhost:8081/thread/${id}/posts`, {
        content: newPostContent,
        user_id: user.user_id,
      })
      .then((res) => {
        alert("Post created successfully!");
        setPosts([
          ...posts,
          {
            post_id: res.data.postId,
            post_content: newPostContent,
            post_username: user.username,
            post_user_id: user.user_id,
            post_created_at: new Date().toISOString(),
          },
        ]);
        setNewPostContent("");
      })
      .catch((err) => console.error("Error creating post:", err));
  };

  // Handle creating a new comment
  const handleCreateComment = (postId) => {
    if (!user) {
      alert("You must be logged in to comment.");
      return;
    }
    if (!newCommentContent) {
      alert("Comment content cannot be empty.");
      return;
    }

    axios
      .post(`http://localhost:8081/post/${postId}/comments`, {
        content: newCommentContent,
        user_id: user.user_id,
      })
      .then((res) => {
        alert("Comment added successfully!");
        setComments([
          ...comments,
          {
            comment_id: res.data.commentId,
            comment_content: newCommentContent,
            comment_username: user.username,
            comment_user_id: user.user_id,
            comment_created_at: new Date().toISOString(),
            post_id: postId,
          },
        ]);
        setNewCommentContent("");
      })
      .catch((err) => console.error("Error creating comment:", err));
  };

  // Handle deleting a post
  const handleDeletePost = (postId) => {
    if (!user) {
      alert("You must be logged in to delete a post.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    axios
      .delete(`http://localhost:8081/posts/${postId}`)
      .then(() => {
        alert("Post deleted successfully!");
        setPosts((prevPosts) =>
          prevPosts.filter((post) => post.post_id !== postId)
        );
        setComments((prevComments) =>
          prevComments.filter((comment) => comment.post_id !== postId)
        );
      })
      .catch((err) => console.error("Error deleting post:", err));
  };

  // Handle deleting a comment
  const handleDeleteComment = (commentId) => {
    if (!user) {
      alert("You must be logged in to delete a comment.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    axios
      .delete(`http://localhost:8081/comments/${commentId}`)
      .then(() => {
        alert("Comment deleted successfully!");
        setComments((prevComments) =>
          prevComments.filter((comment) => comment.comment_id !== commentId)
        );
      })
      .catch((err) => console.error("Error deleting comment:", err));
  };

  // Check if the current user is following another user
  const checkFollowStatus = (userId) => {
    if (!user) return;

    axios
      .get(`http://localhost:8081/user/${user.user_id}/followees`)
      .then((res) => {
        const followees = res.data.map((followee) => followee.user_id);
        setFollowStatus((prevState) => ({
          ...prevState,
          [userId]: followees.includes(userId),
        }));
      })
      .catch((err) => console.error("Error checking follow status:", err));
  };

  // Handle Follow/Unfollow User
  const toggleFollowUser = (targetUserId) => {
    if (!user) {
      alert("You must be logged in to follow or unfollow a user.");
      return;
    }

    const isFollowing = followStatus[targetUserId];

    if (isFollowing) {
      // Unfollow
      axios
        .delete(`http://localhost:8081/user/${targetUserId}/unfollow`, {
          data: { follower_id: user.user_id },
        })
        .then(() => {
          setFollowStatus((prevState) => ({
            ...prevState,
            [targetUserId]: false,
          }));
          alert("Unfollowed successfully!");
        })
        .catch((err) => console.error("Error unfollowing user:", err));
    } else {
      // Follow
      axios
        .post(`http://localhost:8081/user/${targetUserId}/follow`, {
          follower_id: user.user_id,
        })
        .then(() => {
          setFollowStatus((prevState) => ({
            ...prevState,
            [targetUserId]: true,
          }));
          alert("Followed successfully!");
        })
        .catch((err) => console.error("Error following user:", err));
    }
  };

  // Handle Send Private Message
  const handleSendMessage = () => {
    if (!messageContent.trim()) {
      alert("Message content cannot be empty.");
      return;
    }

    axios
      .post(`http://localhost:8081/messages`, {
        sender_id: user.user_id,
        receiver_id: messageReceiverId,
        content: messageContent,
      })
      .then(() => {
        alert("Message sent successfully!");
        setMessageContent("");
        setIsModalOpen(false); // Close the modal
      })
      .catch((err) => console.error("Error sending message:", err));
  };

  const openMessageModal = (receiverId) => {
    if (!user) {
      alert("You must be logged in to send a message.");
      return;
    }
    setMessageReceiverId(receiverId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setMessageContent("");
  };

  return (
    <div className="container mt-5">
      {/* Back to Threads Button */}
      <button
        className="btn btn-outline-secondary mb-3"
        onClick={() => navigate(-1)}
      >
        Back to Threads
      </button>

      <h2 className="text-primary">Posts and Comments</h2>

      {/* Posts Section */}
      {posts.map((post) => (
        <div key={post.post_id} className="card p-3 mb-3">
          <div className="d-flex align-items-center mb-2">
            <h5 className="text-secondary me-3">{post.post_username}</h5>
            {user && user.user_id !== post.post_user_id && (
              <>
                <button
                  className={`btn btn-sm me-2 ${
                    followStatus[post.post_user_id]
                      ? "btn-danger"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => toggleFollowUser(post.post_user_id)}
                  onMouseOver={() => checkFollowStatus(post.post_user_id)}
                >
                  {followStatus[post.post_user_id] ? "Unfollow" : "Follow"}
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => openMessageModal(post.post_user_id)}
                >
                  Message
                </button>
              </>
            )}
            {/* Add Delete button if the logged-in user is the author of the post */}
            {user && user.user_id === post.post_user_id && (
              <button
                className="btn btn-sm btn-outline-danger ms-2"
                onClick={() => handleDeletePost(post.post_id)}
              >
                Delete
              </button>
            )}
          </div>
          <p>{post.post_content}</p>
          <p className="text-muted">
            {new Date(post.post_created_at).toLocaleString()}
          </p>

          {/* Comments Section */}
          <h6 className="text-secondary">Comments</h6>
          {comments
            .filter((comment) => comment.post_id === post.post_id)
            .map((comment) => (
              <div key={comment.comment_id} className="ms-3">
                <p className="mb-1 d-flex align-items-center">
                  <strong className="me-2">{comment.comment_username}</strong>
                  {user && user.user_id !== comment.comment_user_id && (
                    <>
                      <button
                        className={`btn btn-sm me-2 ${
                          followStatus[comment.comment_user_id]
                            ? "btn-danger"
                            : "btn-outline-primary"
                        }`}
                        onClick={() =>
                          toggleFollowUser(comment.comment_user_id)
                        }
                        onMouseOver={() =>
                          checkFollowStatus(comment.comment_user_id)
                        }
                      >
                        {followStatus[comment.comment_user_id]
                          ? "Unfollow"
                          : "Follow"}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => openMessageModal(post.post_user_id)}
                      >
                        Message
                      </button>
                    </>
                  )}
                  {/* Add Delete button if the logged-in user is the author of the comment */}
                  {user && user.user_id === comment.comment_user_id && (
                    <button
                      className="btn btn-sm btn-outline-danger ms-2"
                      onClick={() => handleDeleteComment(comment.comment_id)}
                    >
                      Delete
                    </button>
                  )}
                </p>
                <p>{comment.comment_content}</p>
                <p className="text-muted" style={{ fontSize: "0.85em" }}>
                  {new Date(comment.comment_created_at).toLocaleString()}
                </p>
              </div>
            ))}

          {/* Add Comment */}
          {user && (
            <div className="mt-2">
              <textarea
                className="form-control mb-2"
                rows="2"
                placeholder="Add a comment..."
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
              ></textarea>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleCreateComment(post.post_id)}
              >
                Add Comment
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Add Post */}
      {user && (
        <div className="card p-3 mt-5">
          <h4 className="text-secondary">Create a New Post</h4>
          <textarea
            className="form-control mb-3"
            rows="3"
            placeholder="Write your post here..."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
          ></textarea>
          <button className="btn btn-primary" onClick={handleCreatePost}>
            Create Post
          </button>
        </div>
      )}

      {/* Modal for Messaging */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Send a Message</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                <textarea
                  className="form-control"
                  rows="5"
                  placeholder="Write your message here..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                ></textarea>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSendMessage}>
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostsAndComments;
