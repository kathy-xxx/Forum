import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { UserContext } from './UserContext';

function Profile() {
    const { user, setUser } = useContext(UserContext); // Use user context
    const [communities, setCommunities] = useState([]);
    const [posts, setPosts] = useState([]);
    const [userActivity, setUserActivity] = useState({ post_count: 0, comment_count: 0 }); // User activity
    const [isEditing, setIsEditing] = useState(false); // Toggle for edit mode
    const [editData, setEditData] = useState({}); // Local state for editing

    // Fetch communities, posts, and user activity
    useEffect(() => {
        if (!user) return;

        axios.get(`http://localhost:8081/user/${user.user_id}/communities`)
            .then(res => setCommunities(res.data))
            .catch(err => console.error("Error fetching communities:", err));

        axios.get(`http://localhost:8081/user/${user.user_id}/posts`)
            .then(res => setPosts(res.data))
            .catch(err => console.error("Error fetching posts:", err));

        axios.get(`http://localhost:8081/user/${user.user_id}/activity`)
            .then(res => setUserActivity(res.data))
            .catch(err => console.error("Error fetching user activity:", err));
    }, [user]);

    // Toggle edit form
    const handleEdit = () => {
        setIsEditing(true);
        setEditData({
            username: user.username,
            email: user.email,
            phone: user.phone || "",
            bio: user.bio || "",
        });
    };

    // Handle input changes
    const handleChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    // Save changes
    const handleSave = (e) => {
        e.preventDefault();
        axios.put(`http://localhost:8081/user/${user.user_id}`, editData)
            .then((res) => {
                setUser(res.data); // Update user context
                setIsEditing(false); // Close edit form
                alert("Profile updated successfully!");
            })
            .catch(err => console.error("Error updating profile:", err));
    };

    return (
        <div className="container mt-5">
            {isEditing ? (
                <form className="card p-4 mb-4" onSubmit={handleSave}>
                    <h3>Edit Profile</h3>
                    <div className="mb-3">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-control"
                            name="username"
                            value={editData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            name="email"
                            value={editData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Phone</label>
                        <input
                            type="text"
                            className="form-control"
                            name="phone"
                            value={editData.phone}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Bio</label>
                        <textarea
                            className="form-control"
                            name="bio"
                            value={editData.bio}
                            onChange={handleChange}
                        ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary me-2">Save</button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setIsEditing(false)}
                    >
                        Cancel
                    </button>
                </form>
            ) : (
                <>
                    <div className="card p-4 mb-4">
                        <h3>{user?.username}'s Profile</h3>
                        <p><strong>Email:</strong> {user?.email}</p>
                        <p><strong>Phone:</strong> {user?.phone || "N/A"}</p>
                        <p><strong>Bio:</strong> {user?.bio || "No bio available"}</p>
                        <p><strong>Joined:</strong> {new Date(user?.join_date).toLocaleDateString()}</p>
                        <p><strong>Posts:</strong> {userActivity.post_count}</p>
                        <p><strong>Comments:</strong> {userActivity.comment_count}</p>
                        <button className="btn btn-primary" onClick={handleEdit}>Edit Profile</button>
                    </div>

                    <div className="card p-4 mb-4">
                        <h4>Communities Joined</h4>
                        {communities.length > 0 ? (
                            <ul className="list-group">
                                {communities.map(community => (
                                    <li key={community.community_id} className="list-group-item">
                                        <Link
                                            to={`/community/${community.community_id}/threads`}
                                            className="text-decoration-none"
                                        >
                                            <strong>{community.name}</strong>
                                        </Link>
                                        : {community.description}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No communities joined.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default Profile;
