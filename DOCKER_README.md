# Docker & Cloudflare Tunnel Setup

This project can be run in a Docker container and securely exposed via Cloudflare Tunnel.

## Prerequisites
1.  **Docker Desktop** installed on your machine.
2.  A **Cloudflare Account** (Zero Trust).

## Setup Instructions

### 1. Get your Tunnel Token
1.  Go to [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/).
2.  Navigate to **Access** > **Tunnels**.
3.  Click **Create a Tunnel**.
4.  Choose **Docker** as the environment.
5.  Copy the token (the long string after `--token` in the install command).
    *   *Note: Do not run the command, just copy the token.*

### 2. Configure Environment
1.  Create a file named `.env` in this directory.
2.  Add your token:
    ```env
    TUNNEL_TOKEN=eyJhIjoi...
    ```

### 3. Run the App
Start the containers:
```bash
docker-compose up -d --build
```

### 4. Configure Public Hostname
1.  Back in the Cloudflare Dashboard (where you created the tunnel).
2.  Click **Next** (or Configure).
3.  **Public Hostname**: Choose a domain (e.g., `tools.yourdomain.com`).
4.  **Service**:
    *   Type: `HTTP`
    *   URL: `app:80` (This matches the service name in `docker-compose.yml`).
5.  Save Tunnel.

## Access
*   **Local:** [http://localhost:8080](http://localhost:8080)
*   **Public:** Your configured Cloudflare domain.

## Maintenance
To update the app after making code changes:
```bash
docker-compose up -d --build
```
