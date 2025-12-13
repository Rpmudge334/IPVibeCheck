#!/bin/bash

# Mithril Server Setup Script
# Run this on your new Debian server to install Docker, Docker Compose, and Git.

set -e

echo "Starting Mithril server setup..."

# 1. Update system
echo "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# 2. Install prerequisites
echo "Installing prerequisites..."
sudo apt-get install -y ca-certificates curl gnupg git nano

# 3. Install Docker
echo "Installing Docker..."
# Add Docker's official GPG key:
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add the repository to Apt sources:
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 4. Enable Docker service
sudo systemctl enable docker
sudo systemctl start docker

# 5. Add current user to docker group (avoid sudo for docker commands)
sudo usermod -aG docker $USER

echo "Setup complete!"
echo "Please log out and log back in for docker group changes to take effect."
echo "Then, you can clone the repository and start the application."
