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

## Accessing Your Deployed Application

Once you have deployed your application, you can access it using the following URLs:

*   **Back-End (Render):** Your Render app will be available at `https://your-app-name.onrender.com`. You will use this URL for the `REACT_APP_API_URL` environment variable in Netlify.
*   **Front-End (Netlify):** Your Netlify site will be available at a URL like `https://random-words.netlify.app`. You can customize this URL in your Netlify site settings. This is the URL you will use to access your site in a web browser.
