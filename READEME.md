# Forum Application

This is a full-stack forum application built using React for the frontend and Node.js with MySQL for the backend. It provides functionality for users to create accounts, join communities, create threads, comment on posts, and interact with other users.

## Project Structure

```
Forum
├── frontend                 # Frontend codebase
│   ├── node_modules         # Node modules for frontend
│   ├── public               # Static files like images and icons
│   │   ├── forum.svg
│   ├── src                  # Source code for the frontend
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── Home.jsx
│   │   ├── index.css
│   │   ├── Login.jsx
│   │   ├── main.jsx
│   │   ├── Navbar.jsx
│   │   ├── PostsAndComments.jsx
│   │   ├── Profile.jsx
│   │   ├── Signup.jsx
│   │   ├── Threads.jsx
│   │   ├── Update.jsx
│   │   └── UserContext.jsx
│   ├── eslint.config.js     # Linter configuration
│   ├── index.html           # Entry HTML for the app
│   ├── package.json         # Dependencies and scripts for frontend
│   ├── package-lock.json    # Lock file for frontend dependencies
│   └── vite.config.js       # Vite configuration
├── server                   # Backend codebase
│   ├── node_modules         # Node modules for backend
│   ├── package.json         # Dependencies and scripts for backend
│   ├── package-lock.json    # Lock file for backend dependencies
│   ├── server.js            # Main backend server file
└── README.md                # Main README file for the project
```

## Features

### Frontend
- **Home.jsx**: The landing page of the application.
- **Login.jsx**: Login form for users to authenticate.
- **Signup.jsx**: Registration form for new users.
- **Profile.jsx**: View and edit user profiles, including user activity (post and comment counts).
- **PostsAndComments.jsx**: Display posts in a thread and associated comments.
- **Threads.jsx**: List all threads in a community.
- **Navbar.jsx**: Navigation bar for seamless navigation.
- **UserContext.jsx**: Context API for managing user state globally.

### Backend
- **server.js**: RESTful API for handling requests, including user authentication, CRUD operations for posts and comments, managing communities, and user follow/unfollow functionality.

## Live Demo

You can view a live demo of the project hosted on a VPS at the following link:

🔗 **[Live Demo](http://64.176.215.30:5173/)**

Feel free to explore the app and see how it works in real-time.

## Project Video

Watch the project video at the following link:

🔗 **[Project Video](https://vimeo.com/1036078941/8951734a7d)**

## Installation and Setup

### Prerequisites
- Node.js installed on your system
- MySQL installed and running
- Vite for running the frontend development server

### Step 1: Clone the Repository
```bash
git clone https://github.com/kathy-xxx/Forum.git
cd Forum
```

### Step 2: Set Up the Backend
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. When the server starts, it will prompt you to enter the following database credentials in the terminal:
   - **Database Username**: The username for connecting to your MySQL database.
   - **Database Password**: The password associated with the database username.
   - **Database Name**: The name of the database you wish to connect to.

5. If the connection fails (e.g., incorrect credentials), the server will prompt you to enter the details again until a successful connection is established.

### Step 3: Set Up the Frontend
1. Navigate to the `frontend` directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the application for production:
   ```bash
   npm run build
   ```
4. Serve the built application:
   ```bash
   npm run preview
   ```

### Step 4: Database Configuration
- On starting the server, you will be prompted to provide MySQL database credentials (username, password, and database name).
- If the connection fails, re-enter the details until the connection succeeds.

## Usage

1. Navigate to `http://localhost:5173` in your browser to access the application.
2. Create an account or log in to access forum functionalities.
3. Join communities, create threads, and interact with other users.

## Folder Details

### Frontend
- **`src/assets`**: Placeholder for images or other assets.
- **`App.jsx`**: Entry point for the React application.
- **`UserContext.jsx`**: Manages global user state with React Context.

### Backend
- **`server.js`**: Contains all server-side routes and database interactions.
- REST API endpoints are used to interact with the database, such as `/user`, `/community`, `/thread`, etc.

## Technologies Used
- **Frontend**: React, Vite, CSS
- **Backend**: Node.js, Express.js, MySQL
- **Database**: MySQL
- **Package Management**: npm

## Contributing
Contributions are welcome! Please fork the repository, make your changes, and create a pull request.

## License
This project is licensed under the MIT License.