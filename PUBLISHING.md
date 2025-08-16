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

**Step 1: Create a PostgreSQL Database on Render**

Before you deploy your web service, you need a production database.

1.  From the Render dashboard, click **New +** and select **PostgreSQL**.
2.  Give your database a unique name (e.g., `mazi-green-energy-db`).
3.  Ensure the **Region** is the same as your web service for the best performance.
4.  Select the **Free** plan.
5.  Click **Create Database**. It will take a few minutes for the database to be ready.

**Step 2: Deploy Your Web Service**

Now, create the web service and link it to the new database.

1.  From the Render dashboard, click **New +** and select **Web Service**.
2.  Connect your Git repository.
3.  Configure the service as before:
    *   **Name:** `mazi-green-energy-server`
    *   **Root Directory:** `server`
    *   **Build Command:** `npm install`
    *   **Start Command:** `node index.js`
    *   **Plan:** Select the **Free** plan.

4.  **Add Environment Variables:**
    *   Scroll down to the **Environment** section.
    *   Click **Add Environment Group** and select the database you just created. This will automatically add the `DATABASE_URL` for you.
    *   Click **Add Environment Variable** to add the other secrets:
        *   `JWT_SECRET`: A long, random string you create for signing tokens.
        *   `CLIENT_URL`: The URL of your deployed Netlify site (e.g., `https://your-site-name.netlify.app`). **Important:** Do not include a trailing slash.

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

*   **`CLIENT_URL`**:
    *   **Purpose**: This tells your backend which frontend URL is allowed to make requests (for CORS).
    *   **How to get it**: This will be the URL of your deployed Netlify site (e.g., `https://your-site-name.netlify.app`).

### Front-End (Netlify)

You will set this in your site's "Build & deploy" > "Environment" settings on Netlify.

*   **`REACT_APP_API_URL`**:
    *   **Purpose**: This tells your React application where to send API requests.
    *   **How to get it**: This is the URL of your deployed **Web Service** on Render (it will look like `https://your-app-name.onrender.com`). You can find this at the top of your service's page in the Render dashboard.
    *   **CRITICAL:** Do **not** use your database URL here.


### Final Troubleshooting Step: Resetting the Production Database

If logins are still failing on your live site after trying everything else, it is likely that your production database is in an incomplete state. Resetting it will ensure the latest initialization script runs on a clean slate.

**Warning:** This will permanently delete all data in your production database.

1.  **Go to your PostgreSQL database on the Render Dashboard.**
2.  Click the **"Settings"** tab.
3.  Scroll to the bottom to the **"Danger Zone"**.
4.  Click the **"Delete Database"** button and follow the confirmation prompts.
5.  **Re-create the database** using the exact same settings as before (Name, Region, Plan).
6.  **Go back to your Web Service settings.**
7.  Under **"Environment"**, ensure the `DATABASE_URL` is correctly linked to the new database (you may need to re-link it).
8.  **Trigger a new deployment** by clicking **"Manual Deploy"** > **"Deploy latest commit"**.

This will force the server to start with a brand new, empty database, and the initialization script will run correctly, creating all tables and the necessary test user.

## Accessing Your Deployed Application

Once you have deployed your application, you can access it using the following URLs:

*   **Back-End (Render):** Your Render app will be available at `https://your-app-name.onrender.com`. You will use this URL for the `REACT_APP_API_URL` environment variable in Netlify.
*   **Front-End (Netlify):** Your Netlify site is available at `https://warm-griffin-19aa15.netlify.app`. This is the URL you will use to access your site in a web browser.
