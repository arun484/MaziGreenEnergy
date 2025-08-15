# Deployment Instructions

This document provides instructions for deploying the Mazi Green Energy application to a cloud environment.

## Prerequisites

*   A cloud provider account (e.g., AWS, Google Cloud, Heroku)
*   A registered domain name (optional)
*   Node.js and npm installed on your local machine

## Back-End Deployment (Server)

1.  **Choose a hosting service:**
    *   **Heroku:** A popular and easy-to-use platform for deploying Node.js applications.
    *   **AWS Elastic Beanstalk:** A fully managed service for deploying and scaling web applications.
    *   **Google App Engine:** A serverless platform for building and deploying applications.

2.  **Set up your environment:**
    *   Create a new application on your chosen hosting service.
    *   Configure the environment variables for your application, including `DATABASE_URL`, `JWT_SECRET`, and `GOOGLE_CLIENT_ID`.

3.  **Deploy your code:**
    *   Push your code to a Git repository (e.g., GitHub, GitLab).
    *   Connect your Git repository to your hosting service and configure automatic deployments.

## Front-End Deployment (Client)

1.  **Choose a hosting service:**
    *   **Netlify:** A popular platform for deploying static websites.
    *   **Vercel:** A platform for deploying front-end applications and serverless functions.
    *   **AWS S3:** A scalable object storage service that can be used to host static websites.

2.  **Build your application:**
    *   Run `npm run build` in the `client` directory to create a production build of your application.

3.  **Deploy your application:**
    *   Deploy the contents of the `client/build` directory to your chosen hosting service.

## Additional Considerations

*   **Database:** You will need to set up a production database (e.g., PostgreSQL, MySQL) and configure your server to connect to it.
*   **Domain Name:** If you have a custom domain name, you will need to configure it to point to your deployed application.
*   **HTTPS:** It is highly recommended that you use HTTPS for your application to ensure that all communication between the client and server is encrypted.
