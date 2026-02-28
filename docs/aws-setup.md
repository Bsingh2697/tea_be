# AWS EC2 Setup Guide

Complete step-by-step guide for deploying the tea_be API on AWS EC2.

---

## Overview

```
Your Mac → SSH → EC2 Server (Ubuntu) → Docker → tea_be API + Redis
```

- **EC2 Instance:** Ubuntu 24.04 LTS, t3.micro
- **Elastic IP:** 13.234.134.238 (permanent, never changes)
- **App Port:** 8080 (maps to container port 3002)
- **Secrets:** Managed via Doppler (no .env files on server)

---

## Prerequisites

Before setting up EC2, make sure these are ready:

- [ ] MongoDB Atlas cluster created (free M0 tier)
- [ ] All secrets added to Doppler `dev` config:
  ```
  NODE_ENV
  PORT
  MONGODB_URI
  JWT_SECRET
  JWT_REFRESH_SECRET
  REDIS_URL=redis://redis:6379
  ```

---

## Step 1 — Launch EC2 Instance

1. Go to AWS Console → **EC2** → **Launch Instance**
2. Fill in:
   - **Name:** `tea_ec2`
   - **AMI:** Ubuntu 24.04 LTS (64-bit x86)
   - **Instance type:** `t3.micro` (free tier eligible)
3. **Key pair:**
   - Click **"Create new key pair"**
   - Name: `tea-ec2-api-key`
   - Type: RSA
   - Format: `.pem`
   - Download and move to `~/.ssh/`:
     ```bash
     mv ~/Downloads/tea-ec2-api-key.pem ~/.ssh/
     chmod 400 ~/.ssh/tea-ec2-api-key.pem
     ```
   - `chmod 400` = read-only by you. SSH refuses to use keys with open permissions.

   **How the .pem key works (simple version):**
   1. You launched EC2 on AWS
   2. AWS asked for a key pair to secure SSH access
   3. You created `tea-ec2-api-key` → AWS downloaded `tea-ec2-api-key.pem` to your Mac
   4. You moved it to `~/.ssh/` and ran `chmod 400` to lock permissions
   5. AWS put the matching public key on your EC2 server automatically

   Now when you SSH in, your Mac proves it has the private key → EC2 lets you in.

   > **One liner:** `.pem` = your password to get into the EC2 server, just in key form instead of text.

4. **Network / Security Group** — click Edit, create `tea-api-sg` with two rules:

   | Type       | Port | Source    | Purpose                        |
   |------------|------|-----------|--------------------------------|
   | SSH        | 22   | My IP     | Only you can SSH into server   |
   | Custom TCP | 8080 | Anywhere  | Public API access              |

5. **Storage:** 20 GiB gp3
6. Click **"Launch instance"**

---

## Step 2 — Elastic IP (Permanent IP)

By default EC2 gets a random IP that changes every time you stop/start it.
Elastic IP gives you a **fixed permanent IP**.

1. EC2 Console → **Network & Security** → **Elastic IPs**
2. Click **"Allocate Elastic IP address"** → **Allocate**
3. Select the new IP → **Actions** → **Associate Elastic IP address**
4. Select `tea_ec2` instance → **Associate**

**Result:** `13.234.134.238` is now permanently assigned to your server.

> If you stop + start your EC2, the IP stays `13.234.134.238` forever.
> Elastic IP is free while attached to a running instance.

---

## Step 3 — SSH Into the Server

From your Mac terminal:

```bash
ssh -i ~/.ssh/tea-ec2-api-key.pem ubuntu@13.234.134.238
```

- `-i ~/.ssh/tea-ec2-api-key.pem` = your private key
- `ubuntu` = default user AWS creates on Ubuntu instances
- `13.234.134.238` = your Elastic IP

First time connecting you'll see a fingerprint warning — type `yes`.

> **Note:** If you change networks (café, hotspot), your IP changes and SSH
> will be blocked. Update Security Group Rule 1 with your new IP.

---

## Step 4 — Install Docker on EC2

Once inside the server (`ubuntu@ip-172-31-39-42:~$`):

### 4a. Add Docker's GPG key
```bash
sudo apt update
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
```

### 4b. Add Docker repository
```bash
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
EOF
```

```bash
sudo apt update
```

### 4c. Install Docker
```bash
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

### 4d. Add ubuntu user to docker group
```bash
sudo usermod -aG docker ubuntu && newgrp docker
```

By default only `root` can run Docker. This adds the `ubuntu` user to the
`docker` group so Docker can be used without `sudo`.

### 4e. Verify
```bash
docker --version          # Docker version 29.x.x
docker compose version    # Docker Compose version v5.x.x
docker ps                 # Empty table = working correctly
```

---

## Step 5 — Deploy the App

### 5a. Give EC2 access to GitHub (private repo)

Generate SSH key on EC2:
```bash
ssh-keygen -t ed25519 -C "tea-ec2" -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub
```

Add the public key to GitHub:
- **GitHub → Settings → SSH and GPG keys → New SSH key**
- Title: `tea-ec2`
- Paste the public key → **Add SSH key**

This allows EC2 to clone your private repo. Two keys in play:

| Key | Lives on | Connects to | Purpose |
|---|---|---|---|
| `tea-ec2-api-key.pem` | Your Mac | EC2 | You → EC2 |
| `id_ed25519` | EC2 server | GitHub | EC2 → GitHub |

### 5b. Clone repo and start the app

```bash
# Clone repo
git clone git@github.com:Bsingh2697/tea_be.git
cd tea_be

# Set Doppler token (get from Doppler dashboard → tea_be → dev → Access → Service Tokens)
export DOPPLER_TOKEN=dp.st.xxxxxxxx

# Start containers
docker compose up -d
```

### 5c. Allow EC2 IP in MongoDB Atlas

Go to **MongoDB Atlas → Network Access → Add IP Address**
- Add `13.234.134.238`
- Click **Confirm**

Without this, MongoDB rejects connections from your EC2 server.

### 5d. Verify

```bash
docker ps   # should show tea_api + tea_redis running

curl -X POST http://13.234.134.238:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123","phone":"1234567890"}'
# Should return success:true with JWT tokens
```

---

## Step 6 — GitHub Actions CI/CD (Auto Deploy)

Every push to `main` automatically deploys to EC2. No manual SSH needed.

### How it works

```
You push to main
↓
GitHub spins up a temporary Ubuntu runner
↓
Runner SSHes into your EC2 (using stored secrets)
↓
Runs: git pull + docker compose up --build
↓
New version live → runner is destroyed
```

### 6a. Add GitHub Secrets

Go to **GitHub repo → Settings → Secrets and variables → Actions → New repository secret**

Add these 3 secrets:

| Secret name | Value |
|---|---|
| `EC2_HOST` | `13.234.134.238` |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | contents of `~/.ssh/tea-ec2-api-key.pem` |

To get the key contents:
```bash
cat ~/.ssh/tea-ec2-api-key.pem
# Copy everything from -----BEGIN RSA PRIVATE KEY----- to -----END RSA PRIVATE KEY-----
# Do NOT include the % at the end
```

### 6b. Workflow file

File: `.github/workflows/deploy.yml`

```yaml
name: Deploy to EC2

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: SSH into EC2 and deploy
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd ~/tea_be
            git pull origin main
            docker compose up -d --build
```

**Line by line:**

| Line | What it does |
|---|---|
| `on: push: branches: main` | Trigger on every push to main |
| `runs-on: ubuntu-latest` | GitHub spins up a temp Ubuntu machine |
| `uses: appleboy/ssh-action` | Pre-built action that handles SSH |
| `host/username/key` | Your EC2 credentials from secrets |
| `git pull origin main` | Pull latest code on EC2 |
| `docker compose up -d --build` | Rebuild image and restart containers |

### 6c. Push and verify

```bash
git add .github/workflows/deploy.yml
git commit -m "feat: add GitHub Actions auto-deploy workflow"
git push origin main
```

Then go to **GitHub repo → Actions tab** to watch it run.

---

## Useful Commands

```bash
# SSH into server
ssh -i ~/.ssh/tea-ec2-api-key.pem ubuntu@13.234.134.238

# Check running containers
docker ps

# Check app logs
docker compose logs -f

# Restart containers
docker compose restart

# Stop containers
docker compose down

# Rebuild and restart
docker compose up -d --build
```

---

## Key Concepts

| Term | What it means |
|---|---|
| EC2 | Virtual machine (server) on AWS |
| AMI | The OS image used to create the server |
| Security Group | Firewall rules — controls which ports are open |
| Elastic IP | Permanent fixed IP address for your server |
| Key pair (.pem) | SSH private key — how you authenticate to the server |
| `ubuntu` user | Default user account AWS creates on Ubuntu instances |
| Docker group | Linux group — members can run Docker without sudo |
| Port 22 | SSH port — staff entrance, your IP only |
| Port 8080 | API port — public, anyone can call your API |

---

## Reference

- [Docker official install guide for Ubuntu](https://docs.docker.com/engine/install/ubuntu/)
