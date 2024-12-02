import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import axios from "axios";

function Navbar() {
  const { user, setUser } = useContext(UserContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  // Fetch notifications when user is logged in
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = () => {
    axios
      .get(`http://localhost:8081/notifications/${user.user_id}`)
      .then((res) => {
        setNotifications(res.data);
        setUnreadCount(res.data.filter((notif) => !notif.read_status).length);
      })
      .catch((err) => console.error("Error fetching notifications:", err));
  };

  const markAsRead = (notificationId) => {
    axios
      .put(`http://localhost:8081/notifications/${notificationId}/read`)
      .then(() => {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.notification_id === notificationId
              ? { ...notif, read_status: true }
              : notif
          )
        );
        setUnreadCount((prev) => prev - 1);
      })
      .catch((err) =>
        console.error("Error marking notification as read:", err)
      );
  };

  const handleLogout = () => {
    setUser(null); // Clear user state
    alert("You have logged out!");
    navigate("/"); // Redirect to home page
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <span
            className="me-2"
            style={{ fontSize: "1.5rem", fontWeight: "bold" }}
          >
            ForumApp
          </span>
          <span
            className="text-muted"
            style={{ fontSize: "0.9rem", fontStyle: "italic" }}
          >
            by XiaoZZhangYSongX
          </span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>
            {user ? (
              <>
                <li className="nav-item dropdown">
                  <button
                    className="nav-link btn btn-link dropdown-toggle"
                    id="navbarDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Notifications{" "}
                    {unreadCount > 0 && (
                      <span className="badge bg-danger">{unreadCount}</span>
                    )}
                  </button>
                  <ul
                    className="dropdown-menu dropdown-menu-end"
                    aria-labelledby="navbarDropdown"
                  >
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <li
                          key={notif.notification_id}
                          className={`dropdown-item ${
                            notif.read_status ? "" : "fw-bold"
                          }`}
                        >
                          <span
                            onClick={() => markAsRead(notif.notification_id)}
                            style={{ cursor: "pointer" }}
                          >
                            {notif.content}
                          </span>
                          <br />
                          <small className="text-muted">
                            {new Date(notif.sent_at).toLocaleString()}
                          </small>
                        </li>
                      ))
                    ) : (
                      <li className="dropdown-item text-muted">
                        No notifications
                      </li>
                    )}
                  </ul>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">
                    {user.username}'s Profile
                  </Link>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link btn btn-link"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/signup">
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
