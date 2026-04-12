# Interview Preparation

Questions and answers based on everything built in this project.

---

## Node.js / Express

**Q: What is middleware in Express?**
A: A function that runs between the request and response. It has access to `req`, `res`, and `next`. Used for auth, validation, logging, rate limiting etc.

**Q: How does your auth middleware work?**
A: It reads the JWT from the Authorization header, verifies it using `jwt.verify()`, attaches the user to `req.user`, and calls `next()`. If invalid, it throws a 401 error.

**Q: What is the difference between `app.use()` and `router.use()`?**
A: `app.use()` applies middleware globally to all routes. `router.use()` applies it only to routes defined on that router.

**Q: How do you handle async errors in Express?**
A: Using an `asyncHandler` wrapper that catches promise rejections and passes them to `next(err)`. Without it, unhandled promise rejections crash the server.

**Q: What is the purpose of the feature-based folder structure?**
A: Each feature (auth, user, tea) is self-contained with its own controller, service, model, routes, and validation. Makes the codebase scalable and easy to split into microservices later.

---

## Authentication & JWT

**Q: How does JWT authentication work in your project?**
A:
1. User logs in → server verifies credentials → generates access token + refresh token
2. Client sends access token in `Authorization: Bearer <token>` header
3. Auth middleware verifies the token on protected routes
4. Access token expires in 7 days, refresh token in 30 days

**Q: What is the difference between access token and refresh token?**
A: Access token is short-lived, used for API requests. Refresh token is long-lived, used only to get a new access token when the old one expires. This limits damage if an access token is stolen.

**Q: Why do you store refresh tokens?**
A: To allow logout — when a user logs out, the refresh token is invalidated so it can't be used to get new access tokens.

**Q: What hashing algorithm do you use for passwords?**
A: bcrypt. It's slow by design (configurable rounds) which makes brute force attacks expensive.

---

## Redis

**Q: Why did you add Redis to this project?**
A: For rate limiting storage. `express-rate-limit` needs a shared store so rate limits work correctly across multiple server restarts or instances. Redis persists the request counts.

**Q: What is rate limiting and why is it important?**
A: Limits how many requests an IP can make in a time window. Prevents brute force attacks on the login endpoint. We set 10 requests per 5 minutes on `/auth/login`.

**Q: What would happen without Redis for rate limiting?**
A: Rate limit counters would be stored in memory. They'd reset on every server restart, making the rate limiter ineffective.

---

## Docker

**Q: What is Docker and why did you use it?**
A: Docker packages your app and all its dependencies into a container that runs identically everywhere — your Mac, EC2, any server. Eliminates "works on my machine" problems.

**Q: Explain your multi-stage Dockerfile.**
A:
- Stage 1 (builder): installs all deps, compiles TypeScript → produces `dist/`
- Stage 2 (production): copies only compiled output, installs production deps only, installs Doppler CLI
- Result: smaller final image, no dev dependencies or source TypeScript in production

**Q: What is Docker Compose and why use it?**
A: Tool to define and run multiple containers together. Our `docker-compose.yml` runs `tea_api` + `tea_redis` containers with a single `docker compose up` command.

**Q: What does `depends_on` do in docker-compose.yml?**
A: Ensures Redis container starts before the API container. Without it, the API might start before Redis is ready.

**Q: What is the difference between `docker ps` and `docker ps -a`?**
A: `docker ps` shows only running containers. `docker ps -a` shows all containers including stopped ones.

---

## Doppler / Secrets Management

**Q: Why use Doppler instead of .env files?**
A: .env files are risky — easily committed to git accidentally. Doppler stores secrets centrally, provides different configs per environment (dev/stg/prd), and injects secrets at runtime without storing them on the server.

**Q: How does Doppler work in your Docker setup?**
A: Doppler CLI is installed inside the Docker image. On startup, `doppler run -- node dist/server.js` reads `DOPPLER_TOKEN` env var, fetches secrets from Doppler, and injects them before the app starts.

**Q: What is a Doppler service token?**
A: A machine credential scoped to a specific project + config. Used by servers/containers instead of personal login. No `doppler login` needed — just set `DOPPLER_TOKEN`.

---

## AWS

**Q: What is EC2?**
A: Elastic Compute Cloud — a virtual machine on AWS. You choose the OS, CPU, memory, and storage. Like renting a computer in AWS's data center.

**Q: What is a security group?**
A: A virtual firewall that controls inbound and outbound traffic for your EC2. We opened port 22 (SSH) and 8080 (API).

**Q: What is an Elastic IP and why did you use it?**
A: A permanent fixed public IP address. Without it, EC2 gets a random IP every time it stops/starts — which would break SSH, domain DNS, and CI/CD scripts.

**Q: What is IAM?**
A: Identity and Access Management — AWS's system for managing users and permissions. We created `terraform-user` with `AdministratorAccess` for Terraform to provision resources.

**Q: What is the difference between stopping and terminating an EC2 instance?**
A: Stop = like shutting down (data preserved, IP released). Terminate = permanent deletion (data lost). Elastic IP prevents IP loss on stop/start.

**Q: What is CIDR notation?**
A: A way to specify IP ranges. `0.0.0.0/0` = all IPs (anywhere). `103.31.40.67/32` = exactly one IP. The number after `/` controls how many IPs are included — smaller number = more IPs.

---

## CI/CD / GitHub Actions

**Q: What is CI/CD?**
A: Continuous Integration / Continuous Deployment. Automates building, testing, and deploying code on every push. We push to main → GitHub Actions SSHes into EC2 → pulls latest code → rebuilds Docker image → restarts containers.

**Q: Explain your GitHub Actions workflow.**
A:
1. Trigger: push to main branch
2. GitHub spins up a temporary Ubuntu runner
3. Runner SSHes into EC2 using stored secrets (EC2_HOST, EC2_USER, EC2_SSH_KEY)
4. Runs: `git pull` + `docker compose up -d --build`
5. Runner is destroyed

**Q: Why store secrets in GitHub instead of on the server?**
A: Centralized, encrypted, and always available to the pipeline. If the server is replaced, you don't need to re-set env vars — GitHub always has them.

**Q: What is the difference between GitHub runner and your EC2?**
A: GitHub runner = temporary Ubuntu machine that runs the deployment script. EC2 = your permanent server that runs the app 24/7. The runner SSHes into EC2 to deploy, then is destroyed.

---

## Terraform

**Q: What is Terraform?**
A: Infrastructure as Code (IaC) tool. Instead of clicking through AWS console, you write code that defines your infrastructure. Reproducible, version-controlled, and automatable.

**Q: What is the difference between `terraform plan` and `terraform apply`?**
A: `plan` = dry run, shows what will be created/changed/destroyed without doing anything. `apply` = actually creates/updates resources on AWS.

**Q: What is Terraform state?**
A: A file (`terraform.tfstate`) that tracks what Terraform has created. Terraform compares current state to desired state to know what changes to make. Never delete it.

**Q: What is the difference between `resource` and `data` in Terraform?**
A: `resource` = create something on AWS. `data` = read existing AWS data without creating anything (e.g. looking up an AMI ID).

**Q: How does Terraform know the order to create resources?**
A: It reads references between resources. `aws_eip` references `aws_instance.tea_api.id` so Terraform knows to create EC2 first, then attach the IP.

**Q: What is a provider in Terraform?**
A: A plugin that lets Terraform interact with a specific platform (AWS, GCP, Azure etc.). Defined in `main.tf` and downloaded by `terraform init`.

---

## General / System Design

**Q: Explain your project architecture.**
A:
- Node.js/Express API with TypeScript
- Feature-based structure (auth, user, tea)
- MongoDB Atlas for data storage
- Redis for rate limiting
- Docker + Docker Compose for containerization
- Doppler for secrets management
- EC2 on AWS for hosting
- GitHub Actions for CI/CD
- Terraform for infrastructure as code

**Q: How would you scale this application?**
A:
- Short term: vertical scaling (larger EC2 instance)
- Medium term: move to ECS Fargate or add load balancer with multiple EC2s
- Long term: Kubernetes (EKS) for auto-scaling, split into microservices

**Q: What security measures did you implement?**
A: JWT authentication, bcrypt password hashing, rate limiting on login, Helmet security headers, NoSQL injection prevention, CORS configuration, request validation with Joi, secrets via Doppler (no .env files), SSH key-based server access.

**Q: What is the difference between SSH port 22 restricted to My IP vs open to all?**
A: Restricted to My IP = only your home network can SSH in (more secure). Open to all = needed for GitHub Actions runner to SSH in (any IP). We opened it to all but protected it with the private key — without the .pem file nobody can get in even if port 22 is open.
