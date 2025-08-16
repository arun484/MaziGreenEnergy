# Local Testing Guide

This guide provides instructions for setting up and running the Mazi Green Energy application on your local machine for development and testing.

## First-Time Setup

Before you start the servers for the first time, run the setup script. This will ensure the database is in a clean state and all dependencies are installed.

```bash
npm run setup
```

## Starting the Servers

To start both the front-end and back-end development servers, run the following command from the root of the project:

```bash
npm run dev
```

This will:
- Start the back-end API server on `http://localhost:5002`.
- Start the front-end React development server on `http://localhost:3000`.

## Test Credentials

The local database is seeded with a sample user. Use the following credentials to log in to the application:

-   **Email:** `test@mazigreen.com`
-   **Password:** `test123`

## Fixing Google Login Locally

If you encounter a `GSI_LOGGER` error in the browser console related to a disallowed origin, you need to authorize your local development environment in your Google Cloud project.

1.  **Go to the Google Cloud Console:** Navigate to [console.cloud.google.com](https://console.cloud.google.com/).
2.  **Select your project.**
3.  **Go to "APIs & Services" > "Credentials".**
4.  **Find your OAuth 2.0 Client ID** that you are using for this project and click on it to edit.
5.  **Under "Authorized JavaScript origins", click "ADD URI".**
6.  **Add the following URIs:**
    -   `http://localhost`
    -   `http://localhost:3000`
7.  **Click "Save".**

It may take a few minutes for the changes to take effect.
