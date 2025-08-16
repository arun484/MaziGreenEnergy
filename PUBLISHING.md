# Publishing Your Application

This guide provides step-by-step instructions for deploying the Mazi Green Energy application to the internet. We will use Render for the back-end and Netlify for the front-end.

## Back-End Deployment (Render)

1.  **Create a Render Account:**
    *   Sign up for a free account at [render.com](https://render.com/). You can connect your GitHub, GitLab, or Bitbucket account for easier setup.

2.  **Create a New Web Service:**
    *   From the Render dashboard, click **New +** and select **Web Service**.
    *   Connect your Git repository where the project is hosted.

3.  **Configure the Service:**
    *   **Name:** Give your service a unique name (e.g., `mazi-green-energy-server`).
    *   **Root Directory:** `server`
    *   **Environment:** `Node`
    *   **Build Command:** `npm install`
    *   **Start Command:** `node index.js`
    *   **Plan:** Select the **Free** plan.

4.  **Add Environment Variables:**
    *   Scroll down to the **Environment** section.
    *   Add the following environment variables:
        *   `DATABASE_URL`: The URL of your production database. (Render offers a free PostgreSQL database you can create and link).
        *   `JWT_SECRET`: A secret key for signing JSON Web Tokens.
        *   `GOOGLE_CLIENT_ID`: Your Google client ID for authentication.

5.  **Deploy:**
    *   Click **Create Web Service**. Render will automatically build and deploy your application. Future pushes to your connected Git branch will trigger automatic redeploys.

### Troubleshooting the 'invalid ELF header' Error

This error occurs when platform-specific compiled files (from `sqlite3`) are committed to your Git repository and then deployed to a different platform (Render's Linux servers). Here is the definitive process to fix it.

**Step 1: Clean Your Git Repository**

You must run these commands in your local terminal to remove the `node_modules` folder from your Git history.

1.  **Remove the folder from Git's tracking:**
    ```bash
    git rm -r --cached server/node_modules
    ```
    *(If you get an error that the file doesn't exist, that's okay. It just means it's already untracked.)*

2.  **Commit the removal:**
    ```bash
    git commit -m "Fix: Remove server/node_modules from Git tracking"
    ```

3.  **Push the changes to your repository:**
    ```bash
    git push
    ```

**Step 2: Clear the Build Cache and Redeploy on Render**

This is the most important step. It forces Render to start from a completely clean slate.

1.  **Go to your service on the Render Dashboard.**
2.  Click the **"Manual Deploy"** button.
3.  Select **"Clear build cache & deploy"** from the dropdown menu.

This will trigger a new deployment that ignores any old, cached files and will correctly install and compile the dependencies for Render's Linux environment.

## Front-End Deployment (Netlify)

1.  **Create a Netlify Account:**
    *   If you don't have one already, sign up for a free account at [netlify.com](https://www.netlify.com/).

2.  **Create a New Site:**
    *   Log in to your Netlify account and click the "New site from Git" button.
    *   Connect your Git repository and select the branch you want to deploy.

3.  **Configure Build Settings:**
    *   **Base directory:** `client`
    *   **Build command:** `npm run build`
    *   **Publish directory:** `client/build`

4.  **Configure Environment Variables:**
    *   You will need to set the following environment variable on your Netlify site:
        *   `REACT_APP_API_URL`: The URL of your deployed Render back-end.
    *   You can set this variable in the "Environment" section of your site settings.

5.  **Deploy Your Site:**
    *   Click the "Deploy site" button to deploy your application.

## Understanding Your Environment Variables

Here is a breakdown of the environment variables you need to configure for deployment.

### Back-End (Render)

You will set these in the "Environment" section of your Web Service on Render.

*   **`DATABASE_URL`**:
    *   **Purpose**: This is the connection string for your production database.
    *   **How to get it**: Render can create a free PostgreSQL database for you. When you create one, Render provides this URL. You can find it in your database's "Info" page on the Render dashboard.

*   **`JWT_SECRET`**:
    *   **Purpose**: This is a secret key used to sign and verify authentication tokens. It must be kept private.
    *   **How to get it**: You must create this yourself. It should be a long, random, and unpredictable string. You can use a password generator to create a strong secret. **Do not use the default value from the example file.**

*   **`GOOGLE_CLIENT_ID`**:
    *   **Purpose**: This is your application's ID for Google OAuth 2.0, allowing users to log in with their Google account.
    *   **How to get it**: You can get this from the Google Cloud Console where you set up your project's credentials.

*   **`CLIENT_URL`**:
    *   **Purpose**: This tells your backend which frontend URL is allowed to make requests (for CORS).
    *   **How to get it**: This will be the URL of your deployed Netlify site (e.g., `https://your-site-name.netlify.app`).

### Front-End (Netlify)

You will set this in your site's "Build & deploy" > "Environment" settings on Netlify.

*   **`REACT_APP_API_URL`**:
    *   **Purpose**: This tells your React application where to send API requests.
    *   **How to get it**: This is the URL of your deployed Render back-end service (e.g., `https://mazi-green-energy-server.onrender.com`). You can find this on your service's page in the Render dashboard.

## Accessing Your Deployed Application

Once you have deployed your application, you can access it using the following URLs:

*   **Back-End (Render):** Your Render app will be available at `https://your-app-name.onrender.com`. You will use this URL for the `REACT_APP_API_URL` environment variable in Netlify.
*   **Front-End (Netlify):** Your Netlify site will be available at a URL like `https://random-words.netlify.app`. You can customize this URL in your Netlify site settings. This is the URL you will use to access your site in a web browser.
