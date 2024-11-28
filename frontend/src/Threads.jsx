import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import Select from "react-select";

function Threads() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadCategories, setNewThreadCategories] = useState([]);
  const { user } = useContext(UserContext);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  // Fetch threads for the community
  useEffect(() => {
    axios
      .get(`http://localhost:8081/community/${id}/threads`)
      .then((res) => {
        setThreads(res.data);
      })
      .catch((err) => console.error("Error fetching threads:", err));

    axios
      .get("http://localhost:8081/categories")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Error fetching categories:", err));
  }, [id]);

  // Handle creating a new thread
  const handleCreateThread = () => {
    if (!user) {
      alert("You must be logged in to create a thread.");
      return;
    }
    if (!newThreadTitle) {
      alert("Thread title cannot be empty.");
      return;
    }

    const categoryIds = newThreadCategories.map((cat) => cat.value);

    axios
      .post(`http://localhost:8081/community/${id}/threads`, {
        title: newThreadTitle,
        user_id: user.user_id,
        categories: categoryIds,
      })
      .then((res) => {
        alert("Thread created successfully!");
        setThreads([
          ...threads,
          {
            thread_id: res.data.threadId,
            title: newThreadTitle,
            username: user.username,
            created_at: new Date().toISOString(),
            categories: newThreadCategories.map((cat) => cat.label).join(", "),
          },
        ]);
        setNewThreadTitle("");
        setNewThreadCategories([]);
      })
      .catch((err) => console.error("Error creating thread:", err));
  };

  const handleFilterByCategory = (selectedOption) => {
    setSelectedCategory(selectedOption ? selectedOption.value : null);
  };

  const filteredThreads = selectedCategory
    ? threads.filter((thread) =>
        thread.categories
          ?.split(", ")
          .includes(
            categories.find((cat) => cat.category_id === selectedCategory)?.name
          )
      )
    : threads;

  return (
    <div className="container mt-5">
      {/* Back to Communities Button */}
      <button
        className="btn btn-outline-secondary mb-3"
        onClick={() => navigate(-1)}
      >
        Back to Communities
      </button>

      <h2 className="text-primary">Threads</h2>
      {/* Category Filter */}
      <div className="mb-3">
        <label className="form-label">Filter by Category</label>
        <Select
          options={[
            { value: null, label: "All Categories" },
            ...categories.map((category) => ({
              value: category.category_id,
              label: category.name,
            })),
          ]}
          onChange={handleFilterByCategory}
          placeholder="Select a category..."
          isClearable
        />
      </div>

      {/* Threads Table */}
      <table className="table table-hover mt-4">
        <thead className="bg-light text-secondary">
          <tr>
            <th>Title</th>
            <th>Created By</th>
            <th>Created At</th>
            <th>Categories</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredThreads.map((thread) => (
            <tr key={thread.thread_id}>
              <td className="fw-bold text-primary">
                <Link
                  to={`/thread/${thread.thread_id}/posts`}
                  className="text-decoration-none text-primary"
                >
                  {thread.title}
                </Link>
              </td>
              <td className="text-secondary">{thread.username}</td>
              <td className="text-muted">
                {new Date(thread.created_at).toLocaleString()}
              </td>
              <td>
                {thread.categories ? (
                  thread.categories.split(", ").map((category, index) => (
                    <span key={index} className="badge bg-info me-1">
                      {category}
                    </span>
                  ))
                ) : (
                  <span className="badge bg-secondary">No Categories</span>
                )}
              </td>
              <td>
                <Link
                  to={`/thread/${thread.thread_id}/posts`}
                  className="btn btn-info btn-sm"
                >
                  View Posts
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Form to create a new thread */}
      {user && (
        <div className="mt-4">
          <h4 className="text-secondary">Create a New Thread</h4>
          <form className="row g-3 align-items-center mt-2">
            {/* Thread Title */}
            <div className="col-md-6">
              <label htmlFor="threadTitle" className="form-label">
                Thread Title
              </label>
              <input
                type="text"
                className="form-control"
                id="threadTitle"
                placeholder="Enter thread title"
                value={newThreadTitle}
                onChange={(e) => setNewThreadTitle(e.target.value)}
              />
            </div>

            {/* Select Categories */}
            <div className="col-md-6">
              <label htmlFor="categories" className="form-label">
                Select Categories
              </label>
              <Select
                id="categories"
                options={categories.map((category) => ({
                  value: category.category_id,
                  label: category.name,
                }))}
                isMulti
                value={newThreadCategories}
                onChange={setNewThreadCategories}
                placeholder="Choose categories..."
              />
            </div>

            {/* Create Thread Button */}
            <div className="col-12 text-end">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCreateThread}
              >
                Create Thread
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Threads;
