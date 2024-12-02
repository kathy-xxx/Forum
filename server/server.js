import express from "express";
import mysql from "mysql";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "cs5200",
  password: "cs5200project",
  database: "Forum",
});

app.get("/communities", (req, res) => {
  const sql = "SELECT * FROM Community";
  db.query(sql, (err, result) => {
    if (err)
      return res.status(500).json({ message: "Error fetching communities" });
    return res.json(result);
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM User WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (result.length > 0) {
      return res.json({ message: "Login successful", user: result[0] });
    } else {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  });
});

app.post("/signup", (req, res) => {
  const { username, email, password } = req.body;
  const sql = "INSERT INTO User (username, email, password) VALUES (?, ?, ?)";
  db.query(sql, [username, email, password], (err, result) => {
    if (err) return res.status(500).json({ message: "Error creating user" });
    return res.json({ message: "User created successfully" });
  });
});

// Get user profile details
app.get("/user/:id", (req, res) => {
  const sql = `
        SELECT user_id, username, email, bio, phone, join_date
        FROM User
        WHERE user_id = ?`;
  const userId = req.params.id;

  db.query(sql, [userId], (err, result) => {
    if (err) return res.json({ error: "Error fetching user profile" });
    return res.json(result[0]);
  });
});

// Update user profile details
app.put("/user/:id", (req, res) => {
  const userId = req.params.id;
  const { username, email, phone, bio } = req.body;

  const sql = `
        UPDATE User 
        SET username = ?, email = ?, phone = ?, bio = ?
        WHERE user_id = ?`;

  db.query(sql, [username, email, phone, bio, userId], (err, result) => {
    if (err) return res.status(500).json({ message: "Server Error" });
    return res.status(200).json({
      user_id: userId,
      username,
      email,
      phone,
      bio,
      join_date: new Date().toISOString(), // For simplicity, not updating join_date
    });
  });
});

// Get communities joined by the user
app.get("/user/:id/communities", (req, res) => {
  const sql = `
        SELECT Community.community_id, Community.name, Community.description
        FROM UserCommunity
        JOIN Community ON UserCommunity.community_id = Community.community_id
        WHERE UserCommunity.user_id = ?`;
  const userId = req.params.id;

  db.query(sql, [userId], (err, result) => {
    if (err) return res.json({ error: "Error fetching user communities" });
    return res.json(result);
  });
});

// Get posts by the user
app.get("/user/:id/posts", (req, res) => {
  const sql = `
        SELECT Post.post_id, Post.content, Thread.title, Post.created_at
        FROM Post
        JOIN Thread ON Post.thread_id = Thread.thread_id
        WHERE Post.user_id = ?`;
  const userId = req.params.id;

  db.query(sql, [userId], (err, result) => {
    if (err) return res.json({ error: "Error fetching user posts" });
    return res.json(result);
  });
});

// Get user activity (post and comment count)
app.get("/user/:id/activity", (req, res) => {
  const userId = req.params.id;
  const sql = `SELECT post_count, comment_count FROM UserActivity WHERE user_id = ?`;

  db.query(sql, [userId], (err, result) => {
    if (err)
      return res.status(500).json({ message: "Error fetching user activity" });
    return res.json(result[0] || { post_count: 0, comment_count: 0 });
  });
});

// Add user to a community
app.post("/user/:id/join", (req, res) => {
  const userId = req.params.id;
  const { community_id } = req.body;

  const sql = `
        INSERT INTO UserCommunity (user_id, community_id) 
        VALUES (?, ?)`;

  db.query(sql, [userId, community_id], (err, result) => {
    if (err)
      return res.status(500).json({ message: "Error joining community" });
    return res.json({ message: "Successfully joined community" });
  });
});

// Get all threads for a community
app.get("/community/:id/threads", (req, res) => {
  const communityId = req.params.id;
  const sql = `
        SELECT Thread.thread_id, Thread.title, Thread.created_at, User.username, 
               GROUP_CONCAT(Category.name) AS categories
        FROM Thread
        JOIN User ON Thread.user_id = User.user_id
        LEFT JOIN ThreadCategory ON Thread.thread_id = ThreadCategory.thread_id
        LEFT JOIN Category ON ThreadCategory.category_id = Category.category_id
        WHERE Thread.community_id = ?
        GROUP BY Thread.thread_id
    `;

  db.query(sql, [communityId], (err, result) => {
    if (err) return res.status(500).json({ error: "Error fetching threads" });
    return res.json(result);
  });
});

// Filter Threads by Category
app.get("/community/:id/threads/filter", (req, res) => {
  const { category } = req.query;
  const communityId = req.params.id;

  const sql = `
        SELECT Thread.thread_id, Thread.title, Thread.created_at, User.username, 
               GROUP_CONCAT(Category.name) AS categories
        FROM Thread
        JOIN User ON Thread.user_id = User.user_id
        LEFT JOIN ThreadCategory ON Thread.thread_id = ThreadCategory.thread_id
        LEFT JOIN Category ON ThreadCategory.category_id = Category.category_id
        WHERE Thread.community_id = ? AND Category.name = ?
        GROUP BY Thread.thread_id
    `;

  db.query(sql, [communityId, category], (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ error: "Error filtering threads by category" });
    return res.json(result);
  });
});

// Filter threads by category
app.get("/community/:id/threads/filter", (req, res) => {
  const { category } = req.query;
  const communityId = req.params.id;

  let sql = `
        SELECT Thread.thread_id, Thread.title, Thread.created_at, User.username, 
               GROUP_CONCAT(Category.name) AS categories
        FROM Thread
        JOIN User ON Thread.user_id = User.user_id
        LEFT JOIN ThreadCategory ON Thread.thread_id = ThreadCategory.thread_id
        LEFT JOIN Category ON ThreadCategory.category_id = Category.category_id
        WHERE Thread.community_id = ?
    `;

  const params = [communityId];
  if (category) {
    sql += ` AND Category.category_id = ?`;
    params.push(category);
  }

  sql += ` GROUP BY Thread.thread_id`;

  db.query(sql, params, (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ error: "Error filtering threads by category" });
    return res.json(result);
  });
});

// Create a new thread in a community
app.post("/community/:id/threads", (req, res) => {
  const communityId = req.params.id;
  const { title, user_id, categories } = req.body;

  const sqlInsertThread = `
        INSERT INTO Thread (title, community_id, user_id) 
        VALUES (?, ?, ?)
    `;

  db.query(sqlInsertThread, [title, communityId, user_id], (err, result) => {
    if (err) return res.status(500).json({ error: "Error creating thread" });

    const threadId = result.insertId;

    if (categories && categories.length > 0) {
      const sqlInsertCategories = `
                INSERT INTO ThreadCategory (thread_id, category_id) 
                VALUES ?
            `;
      const values = categories.map((categoryId) => [threadId, categoryId]);

      db.query(sqlInsertCategories, [values], (err) => {
        if (err)
          return res.status(500).json({ error: "Error assigning categories" });
        return res.json({ message: "Thread created successfully", threadId });
      });
    } else {
      return res.json({ message: "Thread created successfully", threadId });
    }
  });
});

// Get all categories
app.get("/categories", (req, res) => {
  const sql = "SELECT * FROM Category";
  db.query(sql, (err, result) => {
    if (err)
      return res.status(500).json({ error: "Error fetching categories" });
    return res.json(result);
  });
});

// Get all posts and their comments for a thread
app.get("/thread/:id/posts", (req, res) => {
  const threadId = req.params.id;
  const sql = `
        SELECT Post.post_id, Post.content AS post_content, Post.created_at AS post_created_at, Post.user_id AS post_user_id, User.username AS post_username
        FROM Post
        JOIN User ON Post.user_id = User.user_id
        WHERE Post.thread_id = ?`;

  db.query(sql, [threadId], (err, posts) => {
    if (err) return res.status(500).json({ error: "Error fetching posts" });

    // Fetch comments for each post
    const commentSql = `
            SELECT Comment.comment_id, Comment.content AS comment_content, Comment.created_at AS comment_created_at, 
                   Comment.user_id AS comment_user_id, User.username AS comment_username, Comment.post_id
            FROM Comment
            JOIN User ON Comment.user_id = User.user_id
            WHERE Comment.post_id IN (?)`;

    const postIds = posts.map((post) => post.post_id);
    if (postIds.length === 0) return res.json({ posts, comments: [] });

    db.query(commentSql, [postIds], (err, comments) => {
      if (err)
        return res.status(500).json({ error: "Error fetching comments" });
      return res.json({ posts, comments });
    });
  });
});

// Create a new post in a thread
app.post("/thread/:id/posts", (req, res) => {
  const threadId = req.params.id;
  const { content, user_id } = req.body;

  const sql = "INSERT INTO Post (content, thread_id, user_id) VALUES (?, ?, ?)";
  db.query(sql, [content, threadId, user_id], (err, result) => {
    if (err) return res.status(500).json({ error: "Error creating post" });
    return res.json({
      message: "Post created successfully",
      postId: result.insertId,
    });
  });
});

// Delete a post and its associated comments
app.delete("/posts/:id", (req, res) => {
  const postId = req.params.id;

  // First, delete all comments associated with the post
  const deleteCommentsSql = "DELETE FROM Comment WHERE post_id = ?";
  db.query(deleteCommentsSql, [postId], (err) => {
    if (err) {
      console.error("Error deleting comments:", err);
      return res.status(500).json({ error: "Error deleting comments" });
    }

    // Then, delete the post itself
    const deletePostSql = "DELETE FROM Post WHERE post_id = ?";
    db.query(deletePostSql, [postId], (err) => {
      if (err) {
        console.error("Error deleting post:", err);
        return res.status(500).json({ error: "Error deleting post" });
      }

      return res.json({ message: "Post deleted successfully" });
    });
  });
});

// Create a new comment on a post
app.post("/post/:id/comments", (req, res) => {
  const postId = req.params.id;
  const { content, user_id } = req.body;

  const sql =
    "INSERT INTO Comment (content, post_id, user_id) VALUES (?, ?, ?)";
  db.query(sql, [content, postId, user_id], (err, result) => {
    if (err) return res.status(500).json({ error: "Error creating comment" });
    return res.json({
      message: "Comment created successfully",
      commentId: result.insertId,
    });
  });
});

// Delete a comment on a post
app.delete("/comments/:id", (req, res) => {
  const commentId = req.params.id;

  // Delete the comment
  const deleteCommentSql = "DELETE FROM Comment WHERE comment_id = ?";
  db.query(deleteCommentSql, [commentId], (err, result) => {
    if (err) return res.status(500).json({ error: "Error deleting comment." });
  });
});

// Create a new community
app.post("/communities", (req, res) => {
  const { name, description, user_id } = req.body;

  // SQL to insert into Community table
  const sqlInsertCommunity =
    "INSERT INTO Community (name, description) VALUES (?, ?)";

  db.query(sqlInsertCommunity, [name, description], (err, result) => {
    if (err)
      return res.status(500).json({ message: "Error creating community" });

    const community_id = result.insertId;

    // SQL to add the creator to UserCommunity table
    const sqlAddCreator =
      "INSERT INTO UserCommunity (user_id, community_id) VALUES (?, ?)";

    db.query(sqlAddCreator, [user_id, community_id], (err, joinResult) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Error adding creator to community" });

      return res.json({
        message: "Community created and user joined successfully",
        community_id: community_id,
      });
    });
  });
});

// Follow a user
app.post("/user/:id/follow", (req, res) => {
  const followerId = req.body.follower_id; // The user performing the follow
  const followeeId = req.params.id; // The user being followed

  if (followerId === followeeId) {
    return res.status(400).json({ message: "You cannot follow yourself" });
  }

  const checkSql = `
        SELECT * FROM Follow 
        WHERE follower_id = ? AND followee_id = ?
    `;
  const insertSql = `
        INSERT INTO Follow (follower_id, followee_id) 
        VALUES (?, ?)
    `;

  // Check if the relationship already exists
  db.query(checkSql, [followerId, followeeId], (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Error checking follow relationship" });
    if (result.length > 0)
      return res
        .status(400)
        .json({ message: "You are already following this user" });

    // Insert the follow relationship
    db.query(insertSql, [followerId, followeeId], (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Error creating follow relationship" });
      return res.json({ message: "Successfully followed user" });
    });
  });
});

// Unfollow a user
app.delete("/user/:id/unfollow", (req, res) => {
  const followerId = req.body.follower_id;
  const followeeId = req.params.id;

  const sql = `
        DELETE FROM Follow 
        WHERE follower_id = ? AND followee_id = ?
    `;

  db.query(sql, [followerId, followeeId], (err, result) => {
    if (err) return res.status(500).json({ message: "Error unfollowing user" });
    if (result.affectedRows === 0) {
      return res
        .status(400)
        .json({ message: "You are not following this user" });
    }
    return res.json({ message: "Successfully unfollowed user" });
  });
});

// Get users followed by the logged-in user
app.get("/user/:id/followees", (req, res) => {
  const userId = req.params.id;
  const sql = `
        SELECT Follow.followee_id AS user_id, User.username
        FROM Follow
        JOIN User ON Follow.followee_id = User.user_id
        WHERE Follow.follower_id = ?`;
  db.query(sql, [userId], (err, result) => {
    if (err)
      return res.status(500).json({ message: "Error fetching followees" });
    return res.json(result);
  });
});

// Get notifications for a user
app.get("/notifications/:user_id", (req, res) => {
  const userId = req.params.user_id;
  const sql = `
        SELECT * FROM Notification 
        WHERE user_id = ? 
        ORDER BY sent_at DESC`;
  db.query(sql, [userId], (err, result) => {
    if (err)
      return res.status(500).json({ error: "Error fetching notifications" });
    return res.json(result);
  });
});

// Mark a notification as read
app.put("/notifications/:notification_id/read", (req, res) => {
  const notificationId = req.params.notification_id;
  const sql = `
        UPDATE Notification 
        SET read_status = TRUE 
        WHERE notification_id = ?`;
  db.query(sql, [notificationId], (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ error: "Error marking notification as read" });
    return res.json({ message: "Notification marked as read" });
  });
});

// Send a private message
app.post("/messages", (req, res) => {
  const { sender_id, receiver_id, content } = req.body;

  if (!sender_id || !receiver_id || !content) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const sql =
    "INSERT INTO PrivateMessage (sender_id, receiver_id, content) VALUES (?, ?, ?)";
  db.query(sql, [sender_id, receiver_id, content], (err, result) => {
    if (err) return res.status(500).json({ error: "Error sending message." });
    return res.json({
      message: "Message sent successfully!",
      messageId: result.insertId,
    });
  });
});

app.listen(8081, () => {
  console.log("Listening");
});
