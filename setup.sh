#!/bin/bash
# This script sets up the local development environment.

# Navigate to the server directory
cd server

# Remove the old database file to ensure a clean start
echo "Removing old database file..."
rm -f database/mazi_green_energy.db

# Install server dependencies
echo "Installing server dependencies..."
npm install

# Navigate to the client directory
cd ../client

# Install client dependencies
echo "Installing client dependencies..."
npm install

echo "Setup complete. You can now start the servers."
