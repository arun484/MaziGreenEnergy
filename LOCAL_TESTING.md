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
