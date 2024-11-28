import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { UserContext } from './UserContext';

function Home() {
    const [communities, setCommunities] = useState([]);
    const [joinedCommunities, setJoinedCommunities] = useState([]);
    const [newCommunityName, setNewCommunityName] = useState('');
    const [newCommunityDescription, setNewCommunityDescription] = useState('');
    const { user } = useContext(UserContext);

    // Fetch all communities
    useEffect(() => {
        axios.get('http://localhost:8081/communities')
            .then(res => setCommunities(res.data))
            .catch(err => console.error("Error fetching communities:", err));
    }, []);

    // Fetch user's joined communities if logged in
    useEffect(() => {
        if (user) {
            axios.get(`http://localhost:8081/user/${user.user_id}/communities`)
                .then(res => setJoinedCommunities(res.data.map(c => c.community_id)))
                .catch(err => console.error("Error fetching joined communities:", err));
        }
    }, [user]);

    const handleJoinCommunity = (communityId) => {
        axios.post(`http://localhost:8081/user/${user.user_id}/join`, { community_id: communityId })
            .then(() => {
                alert('Successfully applied to join the community!');
                setJoinedCommunities([...joinedCommunities, communityId]);
            })
            .catch(err => console.error('Error joining community:', err));
    };

    const handleCreateCommunity = () => {
        if (!newCommunityName || !newCommunityDescription) {
            alert("Both name and description are required to create a community.");
            return;
        }
    
        axios.post('http://localhost:8081/communities', {
            name: newCommunityName,
            description: newCommunityDescription,
            user_id: user.user_id
        })
            .then((res) => {
                const { community_id } = res.data;
                alert('Community created successfully!');
    
                // Update communities and joinedCommunities state
                setCommunities([...communities, { 
                    community_id: community_id,
                    name: newCommunityName, 
                    description: newCommunityDescription 
                }]);
                setJoinedCommunities([...joinedCommunities, community_id]);
    
                // Reset input fields
                setNewCommunityName('');
                setNewCommunityDescription('');
            })
            .catch(err => console.error('Error creating community:', err));
    };    

    return (
        <div className="d-flex vh-100 bg-gradient justify-content-center align-items-center">
            <div className="card p-4 w-75">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="text-primary">Communities</h2>
                    {user && (
                        <button 
                            className="btn btn-primary btn-sm"
                            data-bs-toggle="modal" 
                            data-bs-target="#createCommunityModal"
                        >
                            Create Community
                        </button>
                    )}
                </div>
                <table className="table table-hover">
                    <thead className="bg-light text-secondary">
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            {user && <th>Action</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {communities.map((community, index) => (
                            <tr key={index}>
                                <td className="text-secondary">{community.community_id}</td>
                                <td className="fw-bold text-primary">{community.name}</td>
                                <td className="text-muted">{community.description}</td>
                                {user && (
                                    <td>
                                        {joinedCommunities.includes(community.community_id) ? (
                                            <Link
                                                to={`/community/${community.community_id}/threads`}
                                                className="btn btn-success btn-sm"
                                            >
                                                Browse Threads
                                            </Link>
                                        ) : (
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => handleJoinCommunity(community.community_id)}
                                            >
                                                Apply to Join
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create Community Modal */}
            <div className="modal fade" id="createCommunityModal" tabIndex="-1" aria-labelledby="createCommunityModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="createCommunityModalLabel">Create a New Community</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Community Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newCommunityName}
                                    onChange={(e) => setNewCommunityName(e.target.value)}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={newCommunityDescription}
                                    onChange={(e) => setNewCommunityDescription(e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button 
                                type="button" 
                                className="btn btn-primary" 
                                onClick={handleCreateCommunity}
                                data-bs-dismiss="modal"
                            >
                                Create Community
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
