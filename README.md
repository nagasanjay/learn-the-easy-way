# 🚀 Deployment Pipeline — Deep-Dive Learning Plan

> This plan is tailored to **your project's actual pipeline** (`blr-dopamine-backend`).
> It takes you from zero to fully understanding every piece, in a logical order.

---

## Your Pipeline at a Glance

```mermaid
graph LR
    A["🧑‍💻 git push to main"] --> B["⚙️ Bitbucket Pipelines"]
    B --> C["📦 npm ci + npm run build"]
    C --> D["🐳 Docker Build"]
    D --> E["☁️ Push to AWS ECR"]
    E --> F["🚢 Deploy to ECS Fargate"]
    F --> G["🔀 ALB + HTTPS"]
    G --> H["🌐 Route53 DNS"]
    H --> I["✅ Live at\nhackathon.inspirit-nonprod.mml.cloud"]
```

> **In plain English:** Every time you push code to the `main` branch on Bitbucket, an automated pipeline builds your Next.js app, packages it inside a Docker container, uploads that container image to AWS, and then tells AWS to run the new version — all without you touching a server.

---

## 📋 Learning Roadmap (11 Modules + Audit)

| # | Module | Key Concepts | Time Estimate |
|---|--------|-------------|---------------|
| 1 | [Docker & Containerization](#module-1-docker--containerization) | Images, Containers, Dockerfile, Multi-stage builds | 2–3 days |
| 2 | [CI/CD Fundamentals](#module-2-cicd-fundamentals) | Pipelines, Steps, Triggers, Environment Variables | 1–2 days |
| 3 | [Bitbucket Pipelines (your CI/CD)](#module-3-bitbucket-pipelines) | [bitbucket-pipelines.yml](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/bitbucket-pipelines.yml), Pipes, Services | 1–2 days |
| 4 | [AWS Core Services — IAM, ECR](#module-4-aws-core--iam--ecr) | IAM Roles, ECR Repositories, Docker Registry | 2 days |
| 5 | [AWS ECS Fargate (your compute)](#module-5-aws-ecs-fargate) | Clusters, Services, Task Definitions, Fargate | 3–4 days |
| 6 | [Networking — ALB, HTTPS, Route53](#module-6-networking--alb-https-route53) | Load Balancers, Target Groups, SSL/TLS, DNS | 2–3 days |
| 7 | [Putting It All Together](#module-7-putting-it-all-together) | End-to-end walkthrough of your pipeline | 1 day |
| 🚨 | [Pipeline Audit](#-pipeline-audit-whats-missing-or-broken) | **5 critical issues found in your current setup** | Review |
| 8 | [Extending the Pipeline](#module-8-extending-the-pipeline--i-want-to-do-x) | Staging, tests, env vars, approvals, scaling | 2–3 days |
| 9 | [Troubleshooting & Debugging](#module-9-troubleshooting--debugging-deployments) | Diagnosing failures, reading logs, rollbacks | 1–2 days |
| 10 | [What to Learn Next](#module-10-what-to-learn-next) | Terraform, Kubernetes, monitoring, security | Ongoing |
| 11 | [Databases, Caches & Storage](#module-11-databases-caches--persistent-storage) | RDS, DynamoDB, Redis, EFS, the "create → secure → inject → use" pattern | 2–3 days |

**Total estimated time: ~4 weeks** (at a comfortable pace)

---

## Module 1: Docker & Containerization

### 🎯 Goal

Understand what Docker is, why it's used, and how your project's [Dockerfile](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/Dockerfile) works.

### 📖 What to Learn

#### 1.1 — Concepts (Day 1)

- **What is a container?** — Think of it as a lightweight, portable "box" that packages your app + all its dependencies so it runs the same everywhere.
- **Container vs VM** — Containers share the host OS kernel (lightweight). VMs each have their own OS (heavy).
- **Image vs Container** — An _image_ is a blueprint/recipe. A _container_ is a running instance of that image.
- **Docker Hub / Registry** — A place to store and share images (like npm for packages, but for containers).

> [!TIP]
> **Analogy:** A Docker image is like a recipe card. A container is the dish you cook from that recipe. You can cook multiple dishes from the same recipe.

#### 1.2 — Your Dockerfile Explained (Day 2)

Your project uses a **multi-stage build** — this is a best practice that keeps the final image small:

```dockerfile
# ── STAGE 1: "build" ──────────────────────────
# Purpose: Install everything, compile the Next.js app
FROM node:22-slim AS build        # Start from a Node.js 22 base image
WORKDIR /app                      # Set working directory inside the container
COPY package*.json ./             # Copy package.json + package-lock.json
RUN npm ci --legacy-peer-deps     # Install dependencies (clean install)
COPY . .                          # Copy ALL project files
RUN npm run build                 # Build the Next.js production bundle

# ── STAGE 2: "production" ─────────────────────
# Purpose: Create a lean image with ONLY what's needed to run
FROM node:22-slim                 # Fresh base (no build tools)
WORKDIR /app
ENV NODE_ENV=production           # Tell Node this is production
ENV PORT=80                       # The app listens on port 80

# Copy ONLY the build artifacts (not source code, not devDependencies)
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/public ./public
# ... etc.

EXPOSE 80                         # Document that port 80 is used
CMD ["npm", "run", "start"]       # Command to run when container starts
```

> [!IMPORTANT]
> **Why multi-stage?** Stage 1 installs dev dependencies and compiles — it's big. Stage 2 copies only the compiled output — it's small. Your deployed image doesn't contain TypeScript sources or build tools.

#### 1.3 — [.dockerignore](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/.dockerignore) Explained

Just like [.gitignore](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/.gitignore) tells Git what to skip, [.dockerignore](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/.dockerignore) tells Docker what NOT to copy into the image. Your project ignores `node_modules/`, `.next/`, [.env](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/.env), etc. — because `npm ci` and `npm run build` recreate them inside the container.

#### 1.4 — Hands-On Exercises

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) on your machine
2. Run `docker build -t dopamine-test .` from your project root
3. Run `docker run -p 3000:80 dopamine-test` and open `http://localhost:3000`
4. Run `docker images` to see the image size
5. Run `docker ps` to see running containers

### 📚 Resources

- [Docker Get Started (official)](https://docs.docker.com/get-started/)
- [Fireship — Docker in 100 Seconds](https://www.youtube.com/watch?v=Gjnup-PuquQ) (YouTube, ~2 min)
- [TechWorld with Nana — Docker Tutorial](https://www.youtube.com/watch?v=3c-iBn73dDE) (YouTube, ~2 hrs)

---

## Module 2: CI/CD Fundamentals

### 🎯 Goal

Understand _what_ CI/CD is and _why_ it exists, before diving into your specific tool (Bitbucket Pipelines).

### 📖 What to Learn

#### 2.1 — Core Concepts

- **CI (Continuous Integration)** — Automatically build and test code every time someone pushes. Catches bugs early.
- **CD (Continuous Delivery/Deployment)** — Automatically deploy the tested code to production (or a staging environment).
- **Pipeline** — A sequence of automated steps: Build → Test → Deploy.
- **Trigger** — What starts the pipeline (e.g., a push to `main`, a pull request, a tag).
- **Environment Variables / Secrets** — Configuration values (like AWS keys) that are injected into the pipeline at runtime, not stored in code.

```mermaid
graph TD
    A["Developer pushes code"] --> B["CI: Build & Test"]
    B -->|Pass| C["CD: Build Docker Image"]
    B -->|Fail| D["❌ Notify developer"]
    C --> E["CD: Push image to registry"]
    E --> F["CD: Deploy to servers"]
    F --> G["✅ App is live"]
```

#### 2.2 — Why CI/CD?

Without CI/CD, you'd manually:

1. SSH into a server
2. `git pull` the latest code
3. Run `npm install && npm run build`
4. Restart the server
5. Hope nothing breaks

With CI/CD, **all of this happens automatically and reliably every time you push**.

### 📚 Resources

- [GitHub — What is CI/CD?](https://resources.github.com/ci-cd/) (article)
- [Fireship — CI/CD in 100 Seconds](https://www.youtube.com/watch?v=scEDHsr3APg) (YouTube)

---

## Module 3: Bitbucket Pipelines

### 🎯 Goal

Understand your project's [bitbucket-pipelines.yml](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/bitbucket-pipelines.yml) line by line.

### 📖 What to Learn

#### 3.1 — File Structure

```yaml
image: node:22 # Default Docker image for steps

pipelines:
  branches:
    main: # Only runs when code is pushed to "main"
      - step: ... # Step 1
      - step: ... # Step 2
      - step: ... # Step 3 (runs AFTER step 2)
```

> [!NOTE]
> Steps run **sequentially** — Step 2 only starts after Step 1 succeeds.

#### 3.2 — Your 4 Pipeline Steps Explained

````carousel
### Step 1: Build and Verify
```yaml
- step:
    name: Build and verify
    caches:
      - node               # Cache node_modules between runs (faster)
    script:
      - npm ci --legacy-peer-deps   # Clean install
      - npm run build               # Build Next.js
```
**Purpose:** "Does the code even compile?" — This is the CI safety net. If `npm run build` fails, the entire pipeline stops here. No broken code reaches AWS.

**Concepts:**
- `npm ci` = clean install (deletes node_modules, installs from lock file)
- `caches: node` = saves node_modules between pipeline runs for speed
<!-- slide -->
### Step 2: Ensure ECR Repository
```yaml
- step:
    name: Ensure ECR repository
    image: amazon/aws-cli:latest       # Uses AWS CLI image
    script:
      - aws ecr describe-repositories ... || aws ecr create-repository ...
```
**Purpose:** Make sure the Docker image registry (ECR) exists on AWS before we try to push to it. If it doesn't exist, create it.

**Concepts:**
- Uses `amazon/aws-cli` image (not Node.js — this step doesn't need Node)
- `||` means "if the first command fails, run the second" (create if not found)
<!-- slide -->
### Step 3: Build & Push Docker Image to ECR
```yaml
- step:
    name: Build and push Docker image to ECR
    services:
      - docker                          # Enables Docker-in-Docker
    script:
      - docker build -t ${ECR_REPOSITORY}:${IMAGE_TAG} .
      - pipe: atlassian/aws-ecr-push-image:2.6.0
```
**Purpose:** Build the Docker image (using your Dockerfile) and push it to AWS ECR.

**Concepts:**
- `services: docker` = enables running Docker commands inside the pipeline
- `IMAGE_TAG=${BITBUCKET_COMMIT}` = tags the image with the Git commit hash (for traceability)
- `pipe:` = a pre-built Bitbucket integration (handles ECR login + push automatically)
<!-- slide -->
### Step 4: Deploy to ECS Fargate
```yaml
- step:
    name: Deploy to ECS Fargate
    script:
      - pipe: atlassian/aws-ecs-deploy:1.12.0
          CLUSTER_NAME: $ECS_CLUSTER
          SERVICE_NAME: $ECS_SERVICE
          FORCE_NEW_DEPLOYMENT: "true"
```
**Purpose:** Tell AWS ECS to pull the new Docker image and replace the running containers.

**Concepts:**
- `FORCE_NEW_DEPLOYMENT` = even if the task definition hasn't changed, force ECS to re-pull and restart
- The ECS deploy pipe handles updating the service to use the latest image
````

#### 3.3 — Environment Variables in Bitbucket

These are set in **Bitbucket → Repository Settings → Repository Variables** (never in code):

| Variable                | What It Is                                        |
| ----------------------- | ------------------------------------------------- |
| `AWS_ACCESS_KEY_ID`     | Your AWS "username" for API access                |
| `AWS_SECRET_ACCESS_KEY` | Your AWS "password" for API access                |
| `AWS_SESSION_TOKEN`     | Temporary token (if using STS)                    |
| `AWS_DEFAULT_REGION`    | e.g., `us-east-1`                                 |
| `ECR_REPOSITORY`        | Name of ECR repo, e.g., `poc-dopamine`            |
| `ECS_CLUSTER`           | Name of ECS cluster, e.g., `poc-dopamine-cluster` |
| `ECS_SERVICE`           | Name of ECS service, e.g., `poc-dopamine-service` |

### 📚 Resources

- [Bitbucket Pipelines — Getting Started](https://support.atlassian.com/bitbucket-cloud/docs/get-started-with-bitbucket-pipelines/)
- [Bitbucket Pipes — ECR Push](https://bitbucket.org/atlassian/aws-ecr-push-image)
- [Bitbucket Pipes — ECS Deploy](https://bitbucket.org/atlassian/aws-ecs-deploy)

---

## Module 4: AWS Core — IAM & ECR

### 🎯 Goal

Understand how AWS permissions work and what ECR (your Docker registry) does.

### 📖 What to Learn

#### 4.1 — AWS IAM (Identity & Access Management)

- **IAM User** — Like a person's login account for AWS. Has an Access Key + Secret Key.
- **IAM Role** — Like a "hat" a service can wear to get permissions. Your ECS tasks wear the `ecsTaskExecutionRole` hat.
- **Policy** — A JSON document that says "allow/deny these actions on these resources."

Your project creates an execution role in [setup-ecs-fargate.sh](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/scripts/aws/setup-ecs-fargate.sh#L244-L272):

```json
{
  "Effect": "Allow",
  "Principal": { "Service": "ecs-tasks.amazonaws.com" },
  "Action": "sts:AssumeRole"
}
```

This says: _"ECS tasks are allowed to assume this role."_

#### 4.2 — AWS ECR (Elastic Container Registry)

- **What:** A private Docker Hub, but on AWS. Stores your Docker images.
- **Why:** Your pipeline pushes images here; ECS pulls images from here.
- **How it looks:** `123456789012.dkr.ecr.us-east-1.amazonaws.com/poc-dopamine:latest`

```mermaid
graph LR
    A["Bitbucket Pipeline\n(docker build)"] -->|"docker push"| B["AWS ECR\n(Image Registry)"]
    B -->|"docker pull"| C["AWS ECS\n(Running Containers)"]
```

#### 4.3 — AWS Secrets Manager

Your project optionally stores the OpenAI API key in Secrets Manager (not in environment variables on the container). This is more secure because:

- The secret is encrypted at rest
- ECS pulls it at container start time
- It never appears in task definitions or logs

### 📚 Resources

- [AWS IAM — Introduction (official)](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html)
- [AWS ECR — Getting Started](https://docs.aws.amazon.com/AmazonECR/latest/userguide/get-started-cli.html)
- [TechWorld with Nana — AWS IAM](https://www.youtube.com/watch?v=iYRV6cFY9J4) (YouTube)

---

## Module 5: AWS ECS Fargate

### 🎯 Goal

Understand how your app actually runs on AWS. This is the **most important module** — ECS Fargate is the heart of your deployment.

### 📖 What to Learn

#### 5.1 — Key Concepts

```mermaid
graph TD
    subgraph "ECS Cluster: poc-dopamine-cluster"
        subgraph "Service: poc-dopamine-service"
            T1["Task 1\n(Container running\nyour Next.js app)"]
            T2["Task 2\n(Another instance\nfor redundancy)"]
        end
    end
```

| Concept             | What It Is                                                                | Your Project's Value   |
| ------------------- | ------------------------------------------------------------------------- | ---------------------- |
| **Cluster**         | A logical grouping of services                                            | `poc-dopamine-cluster` |
| **Service**         | Manages how many containers (tasks) run and keeps them healthy            | `poc-dopamine-service` |
| **Task Definition** | A "recipe" describing the container — image, CPU, memory, ports, env vars | `poc-dopamine-task`    |
| **Task**            | A single running instance of the task definition (= 1 running container)  | 2 tasks (min)          |
| **Fargate**         | AWS manages the underlying servers for you. You only define CPU + memory. | 512 CPU / 1024 MB      |

> [!TIP]
> **Fargate vs EC2 launch type:** With Fargate, you never SSH into a server or manage OS updates. AWS handles the infrastructure. With EC2, you'd manage the servers yourself. Fargate is simpler but slightly more expensive.

#### 5.2 — Task Definition Deep Dive

The task definition in your [setup-ecs-fargate.sh](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/scripts/aws/setup-ecs-fargate.sh#L399-L449) defines:

```
┌─────────────────────────────────────┐
│ Task Definition: poc-dopamine-task  │
│                                     │
│  CPU: 512 (0.5 vCPU)               │
│  Memory: 1024 MB                    │
│  Network: awsvpc                    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Container: "web"            │    │
│  │  Image: ECR/poc-dopamine    │    │
│  │  Port: 80                   │    │
│  │  Env: NODE_ENV=production   │    │
│  │  Logs: CloudWatch           │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

#### 5.3 — Autoscaling

Your project configures autoscaling (lines 498–527 of [setup-ecs-fargate.sh](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/scripts/aws/setup-ecs-fargate.sh)):

- **Min tasks:** 2 (always at least 2 containers running — for redundancy)
- **Max tasks:** 4 (scale up to 4 if load increases)
- **CPU target:** 60% — if average CPU exceeds 60%, add more tasks
- **Memory target:** 75% — if average memory exceeds 75%, add more tasks

#### 5.4 — Deployment Strategy

```
deployment-configuration:
  maximumPercent: 200         ← Can temporarily run 2x the containers
  minimumHealthyPercent: 100  ← Never drop below the current count
  deploymentCircuitBreaker:
    enable: true              ← Auto-rollback if new version is unhealthy
    rollback: true
```

This means during deployment:

1. ECS starts **new** tasks with the updated image
2. Waits for them to be healthy
3. Only then stops the **old** tasks
4. If the new tasks keep crashing, it **automatically rolls back** to the previous version

### 📚 Resources

- [AWS ECS Workshop](https://ecsworkshop.com/) (hands-on)
- [Fireship — AWS for Beginners](https://www.youtube.com/watch?v=k1RI5locZE4) (YouTube)
- [TechWorld with Nana — ECS Fargate](https://www.youtube.com/watch?v=esISkPlnxL0) (YouTube)

---

## Module 6: Networking — ALB, HTTPS, Route53

### 🎯 Goal

Understand how internet traffic reaches your containers, and how HTTPS/DNS works.

### 📖 What to Learn

#### 6.1 — The Full Network Path

```mermaid
graph LR
    User["👤 User visits\nhttps://poc.dopamine\n.inspirit-nonprod.mml.cloud"] --> DNS["🌐 Route53\n(DNS Lookup)\n→ ALB IP"]
    DNS --> ALB["🔀 ALB\n(Load Balancer)"]
    ALB -->|Port 443\nHTTPS| TG["🎯 Target Group"]
    TG --> Task1["📦 Task 1\n:80"]
    TG --> Task2["📦 Task 2\n:80"]

    ALBRedirect["ALB Port 80\nHTTP"] -->|"301 Redirect\n→ HTTPS"| ALB
```

#### 6.2 — Application Load Balancer (ALB)

- **What:** A "traffic cop" that sits in front of your containers and distributes requests.
- **Why you need it:**
  1. **Load balancing** — distributes traffic across multiple tasks
  2. **HTTPS termination** — handles SSL/TLS so your containers don't have to
  3. **Health checks** — removes unhealthy containers from rotation
- **Your ALB:** `poc-dopamine-alb`

#### 6.3 — Target Group

- **What:** A group of "targets" (your ECS tasks) that the ALB sends traffic to.
- **Health checks:** The ALB pings `GET /` on each task. If a task doesn't respond with 200, it's removed.
- **Your Target Group:** `poc-dopamine-tg` (type: `ip`, port: `80`)

#### 6.4 — HTTPS & SSL Certificates (ACM)

- **ACM (AWS Certificate Manager)** — Provides free SSL certificates for your domain.
- **DNS Validation** — To prove you own the domain, ACM asks you to add a specific DNS record. Your [manage-certificate.sh](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/scripts/aws/manage-certificate.sh) automates this via Route53.
- **How it works on ALB:**
  - Port `443` (HTTPS) → Listener with ACM certificate → Forwards to target group
  - Port `80` (HTTP) → Listener that redirects to HTTPS (301)

#### 6.5 — Route53 (DNS)

- **What:** AWS's DNS service. Maps domain names to IP addresses.
- **Alias Record:** Your setup creates an "A record alias" that maps `poc.dopamine.inspirit-nonprod.mml.cloud` → ALB's DNS name.
- **Why alias (not CNAME)?** Can be used on the zone apex, and Route53 resolves it for free.

#### 6.6 — VPC, Subnets, Security Groups

- **VPC** — Your isolated virtual network on AWS.
- **Subnets** — Subdivisions of your VPC, each in a different Availability Zone (for redundancy).
- **Security Groups** — Firewall rules:
  - ALB security group: allows inbound 80/443 from anywhere
  - ECS security group: allows inbound 80 **only from the ALB security group**

Your [discover-ecs-network.sh](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/scripts/aws/discover-ecs-network.sh) helps you find these values.

### 📚 Resources

- [AWS ALB — How it Works](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html)
- [AWS Route53 — What is DNS?](https://aws.amazon.com/route53/what-is-dns/)
- [ByteByteGo — HTTPS in 5 minutes](https://www.youtube.com/watch?v=j9QmMEWmcfo) (YouTube)

---

## Module 7: Putting It All Together

### 🎯 Goal

Walk through **your entire pipeline** end-to-end and understand what happens at every step.

### 📖 The Complete Flow

```
  YOU                BITBUCKET              AWS ECR             AWS ECS           USER
   │                    │                     │                   │                 │
   │ git push main      │                     │                   │                 │
   │───────────────────>│                     │                   │                 │
   │                    │ Step 1: npm build   │                   │                 │
   │                    │──────────┐          │                   │                 │
   │                    │          │ ✅ pass   │                   │                 │
   │                    │<─────────┘          │                   │                 │
   │                    │                     │                   │                 │
   │                    │ Step 2: Ensure ECR  │                   │                 │
   │                    │────────────────────>│ ✅ exists          │                 │
   │                    │                     │                   │                 │
   │                    │ Step 3: docker build│                   │                 │
   │                    │ + push              │                   │                 │
   │                    │────────────────────>│ 📦 image stored   │                 │
   │                    │                     │                   │                 │
   │                    │ Step 4: ECS deploy  │                   │                 │
   │                    │────────────────────────────────────────>│                 │
   │                    │                     │                   │ Pull new image   │
   │                    │                     │<──────────────────│                 │
   │                    │                     │                   │ Start new tasks  │
   │                    │                     │                   │ Stop old tasks   │
   │                    │                     │                   │                 │
   │                    │                     │                   │ ✅ Live!         │
   │                    │                     │                   │────────────────>│
   │                    │                     │                   │                 │
```

### 📖 Script-by-Script Map

| File                                                                                                                                  | What It Does                                                  | When It Runs                          |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------- |
| [bitbucket-pipelines.yml](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/bitbucket-pipelines.yml)             | Defines the 4-step CI/CD pipeline                             | Every push to `main`                  |
| [Dockerfile](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/Dockerfile)                                       | Multi-stage build to create the production Docker image       | During pipeline Step 3                |
| [.dockerignore](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/.dockerignore)                                 | Excludes files from the Docker build context                  | During pipeline Step 3                |
| [setup-ecs-fargate.sh](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/scripts/aws/setup-ecs-fargate.sh)       | One-time infra setup: ECR, ECS, ALB, DNS, autoscaling         | Run manually once                     |
| [manage-certificate.sh](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/scripts/aws/manage-certificate.sh)     | Manages SSL certs via ACM + Route53                           | Run manually if needed                |
| [discover-ecs-network.sh](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/scripts/aws/discover-ecs-network.sh) | Lists VPCs, subnets, security groups                          | Run manually to discover network info |
| [.env.example](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/infra/ecs/.env.example)                         | Template for all environment variables needed by setup script | Reference only                        |

### 🧪 Hands-On Exercises

> [!CAUTION]
> These exercises involve real AWS resources that may incur costs. Use a personal/sandbox account if possible, or ask your team lead for a safe environment to practice in.

#### Exercise 1: Trace a Deployment

1. Go to your Bitbucket repo → **Pipelines** tab
2. Find a recent successful pipeline run on `main`
3. Click into each step and read the logs
4. For each step, write down in your own words: _What did this step do?_

#### Exercise 2: Docker Locally

1. Build the image: `docker build -t my-test .`
2. Run it: `docker run -p 3000:80 my-test`
3. Open `http://localhost:3000`
4. Stop it: `docker stop <container-id>`

#### Exercise 3: Explore AWS Console

1. Log in to AWS Console
2. Go to **ECR** → Find `poc-dopamine` → Look at the image tags (commit hashes)
3. Go to **ECS** → Find the cluster → Click into the service → See running tasks
4. Go to **EC2 → Load Balancers** → Find the ALB → Check listeners and target groups
5. Go to **Route53** → Find the hosted zone → See the alias record

#### Exercise 4: Read CloudWatch Logs

1. Go to **CloudWatch → Log Groups** → `/ecs/poc-dopamine-task`
2. Find a recent log stream
3. Read the Next.js startup logs — you'll see `next start` output here

---

## 🚨 Pipeline Audit: What's Missing or Broken

After auditing your codebase, I found several **critical gaps** between what your code needs at runtime and what your deployment pipeline actually provides.

### Audit Result Summary

| #   | Issue                                             | Severity    | Status        |
| --- | ------------------------------------------------- | ----------- | ------------- |
| 1   | AWS S3 credentials not injected into ECS tasks    | 🔴 Critical | Missing       |
| 2   | `USE_LOCAL_LLM` / `OPENAI_MODEL` not set in ECS   | 🔴 Critical | Missing       |
| 3   | Activity logs written to ephemeral container disk | 🟡 Warning  | Design risk   |
| 4   | No dedicated health check endpoint                | 🟡 Warning  | Sub-optimal   |
| 5   | [.env](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/.env) contains hardcoded AWS keys                | 🔴 Critical | Security risk |

---

### Issue 1: AWS S3 Credentials Not Injected into ECS

**The problem:** Your app uses S3 ([aws-s3.ts](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/lib/aws-s3.ts)) and reads these env vars at runtime:

```typescript
process.env.AWS_ACCESS_KEY_ID;
process.env.AWS_SECRET_ACCESS_KEY;
process.env.AWS_REGION;
```

But your task definition only injects `NODE_ENV` and `PORT`:

```json
"environment": [
  { "name": "NODE_ENV", "value": "production" },
  { "name": "PORT", "value": "80" }
]
```

**S3 access will silently fail** in production because `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are empty strings.

**How to fix (recommended: use IAM Task Role instead of keys):**

Instead of injecting AWS access keys as env vars, give the ECS task an **IAM Task Role** with S3 permissions. The AWS SDK automatically picks up the role's credentials — no hardcoded keys needed.

1. Add a `taskRoleArn` to the task definition (separate from `executionRoleArn`):

```json
{
  "family": "poc-dopamine-task",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/poc-dopamine-task-role", // ← ADD
  "executionRoleArn": "..."
}
```

2. Create the role with an S3 policy:

```json
{
  "Effect": "Allow",
  "Action": ["s3:GetObject"],
  "Resource": "arn:aws:s3:::hackathon-unity-files/*"
}
```

3. Update [aws-s3.ts](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/lib/aws-s3.ts) to remove hardcoded credentials:

```typescript
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  // No credentials needed — SDK auto-detects the IAM role
});
```

> [!IMPORTANT]
> **This is the AWS best practice.** Never use long-lived access keys in containers. Use IAM Task Roles instead.

---

### Issue 2: `USE_LOCAL_LLM` / `OPENAI_MODEL` Not Set in ECS

**The problem:** Your app reads these env vars in [openai.ts](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/lib/openai.ts):

```typescript
process.env.USE_LOCAL_LLM; // "true" or "false"
process.env.OPENAI_MODEL; // "gpt-4o-mini"
process.env.OLLAMA_MODEL; // "llama3.2"
```

None of these are injected into the ECS task definition. The app defaults to `USE_LOCAL_LLM=false` (good) and `OPENAI_MODEL=gpt-4o-mini` (okay), but this is implicit and fragile.

**How to fix:** Add them to the task definition environment:

```json
"environment": [
  { "name": "NODE_ENV", "value": "production" },
  { "name": "PORT", "value": "80" },
  { "name": "USE_LOCAL_LLM", "value": "false" },       // ← ADD
  { "name": "OPENAI_MODEL", "value": "gpt-4o-mini" },  // ← ADD
  { "name": "AWS_REGION", "value": "us-east-1" }       // ← ADD
]
```

---

### Issue 3: Activity Logs on Ephemeral Disk

**The problem:** Your app writes logs to [activity-logs/events.log](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/activity-logs/events.log) inside the container. On ECS Fargate, **container storage is ephemeral** — every time a task restarts or a new deployment happens, these logs are **permanently lost**.

**Why it might be okay for now:** If these logs are only for demo purposes and you don't need long-term retention, this is fine.

**How to fix (if you need persistent logs):**

- **Option A:** Write logs to CloudWatch (add a logger that writes to stdout — Next.js already pipes stdout to CloudWatch via the `awslogs` driver)
- **Option B:** Write logs to S3 (append to an S3 object or use a periodic upload)
- **Option C:** Use Amazon EFS (Elastic File System) — attaches a persistent network disk to Fargate tasks

---

### Issue 4: No Dedicated Health Check Endpoint

**The problem:** Your ALB health check hits `GET /` (the homepage). This works, but:

- It's slower (renders the full page)
- It might fail if the page has a runtime error that only affects rendering

**How to fix:** Create a lightweight health check API route:

```typescript
// app/api/health/route.ts
export function GET() {
  return Response.json({ status: "ok" }, { status: 200 });
}
```

Then update `HEALTH_CHECK_PATH` in your env to `/api/health`.

---

### Issue 5: [.env](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/.env) Contains Hardcoded AWS Keys

**The problem:** Your [.env](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/.env) file contains real AWS access keys:

```
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=lrAk...
```

> [!CAUTION]
> **This is a serious security risk.** If this file is committed to Git (check [.gitignore](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/.gitignore) — it IS listed, so you're likely safe), anyone with repo access can steal these credentials. Even if gitignored, these keys are sitting in plaintext on your local machine.
>
> **Immediate action:** Rotate these AWS keys in the IAM Console, and move to the IAM Task Role approach described in Issue 1.

---

## Module 11: Databases, Caches & Persistent Storage

### 🎯 Goal

Understand when and how to add databases, caches, and persistent storage to a containerized deployment. **Your project doesn't currently use any of these**, but you asked about them — and knowing this will be essential when you extend the project.

### 📖 Why Your Project Doesn't Have a Database (Yet)

Your app currently stores data in:

- **Files on disk** ([activity-logs/events.log](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/activity-logs/events.log)) — ephemeral, lost on redeploy
- **In-memory** (knowledge base embeddings) — recreated each time
- **AWS S3** (Unity build files) — external persistent storage
- **Client-side** (browser localStorage/state) — not server-managed

This works for a POC/hackathon project, but **will not scale** if you need:

- User accounts / authentication
- Persistent data across deployments
- Data querying and relationships
- Shared state across multiple container instances

### 📖 When to Add What

```mermaid
graph TD
    Q["What kind of data\ndo I need to store?"]
    Q --> A["Structured data with\nrelationships?"]
    Q --> B["Fast temporary data\n/ session state?"]
    Q --> C["Files / objects\n/ media?"]
    Q --> D["Log data /\ntime-series data?"]

    A --> A1["🗄️ Database\n(RDS / DynamoDB)"]
    B --> B1["⚡ Cache\n(ElastiCache Redis)"]
    C --> C1["📦 Object Storage\n(S3 - you already have this)"]
    D --> D1["📊 CloudWatch Logs\nor OpenSearch"]
```

### 📖 Adding a Database to Your Pipeline

#### Option A: Amazon RDS (Relational — PostgreSQL/MySQL)

**What it is:** A managed relational database. You get a PostgreSQL or MySQL server without managing the OS, backups, or updates.

**What you'd need to do:**

| Step                    | Where                       | What                                                                   |
| ----------------------- | --------------------------- | ---------------------------------------------------------------------- |
| 1. Create RDS instance  | AWS Console or setup script | Choose PostgreSQL, set username/password, put in same VPC              |
| 2. Store DB credentials | Secrets Manager             | `DATABASE_URL=postgres://user:pass@rds-endpoint:5432/dbname`           |
| 3. Inject into ECS task | [setup-ecs-fargate.sh](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/scripts/aws/setup-ecs-fargate.sh)      | Add `DATABASE_URL` to the task definition's `secrets` array            |
| 4. Allow network access | Security Groups             | ECS security group → allow outbound to RDS security group on port 5432 |
| 5. Add ORM to your app  | [package.json](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/package.json)              | Install Prisma, Drizzle, or Knex.js                                    |
| 6. Run migrations in CI | [bitbucket-pipelines.yml](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/bitbucket-pipelines.yml)   | Add a step: `npx prisma migrate deploy`                                |

**Architecture with RDS:**

```mermaid
graph LR
    ALB["ALB"] --> ECS["ECS Tasks"]
    ECS --> RDS["Amazon RDS\n(PostgreSQL)"]
    ECS --> S3["S3\n(Unity Files)"]

    SM["Secrets Manager\n(DB password)"] -.->|injected at startup| ECS
```

**Resources:**

- [Prisma — Getting Started with Next.js](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases-typescript-postgresql)
- [AWS RDS — Creating a DB Instance](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_CreateDBInstance.html)

#### Option B: Amazon DynamoDB (NoSQL — Key-Value)

**What it is:** A fully managed NoSQL database. No server to provision — you just create a table and read/write items.

**When to use instead of RDS:**

- You don't need complex queries or JOINs
- You want truly serverless (pay per request, no idle cost)
- Your data is key-value pairs (e.g., user settings, session data)

**What you'd need to do:**

| Step                     | Where                       | What                                                                                  |
| ------------------------ | --------------------------- | ------------------------------------------------------------------------------------- |
| 1. Create DynamoDB table | AWS Console or setup script | Define table name + primary key                                                       |
| 2. Allow access          | IAM Task Role               | Add `dynamodb:GetItem`, `dynamodb:PutItem`, etc. to the task role policy              |
| 3. Use AWS SDK           | Your app code               | `@aws-sdk/client-dynamodb` (already in your dependency tree via `@aws-sdk/client-s3`) |

> [!TIP]
> DynamoDB doesn't need credentials in env vars — it uses the same IAM Task Role as S3. If you fix Issue 1 above, DynamoDB access comes "for free."

### 📖 Adding a Cache

#### Amazon ElastiCache (Redis)

**What it is:** A managed Redis instance. Use for:

- Session storage (share user sessions across multiple ECS tasks)
- API response caching (avoid re-calling OpenAI for identical questions)
- Rate limiting

**What you'd need to do:**

| Step                    | Where                       | What                                                       |
| ----------------------- | --------------------------- | ---------------------------------------------------------- |
| 1. Create Redis cluster | AWS Console or setup script | Put in same VPC as ECS                                     |
| 2. Get endpoint         | AWS Console                 | e.g., `my-redis.xxxx.cache.amazonaws.com:6379`             |
| 3. Set env var          | Task definition             | `REDIS_URL=redis://my-redis.xxxx.cache.amazonaws.com:6379` |
| 4. Allow network access | Security Groups             | ECS SG → allow outbound to Redis SG on port 6379           |
| 5. Add Redis client     | [package.json](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/package.json)              | `npm install ioredis`                                      |

**Resources:**

- [ioredis — GitHub](https://github.com/redis/ioredis)
- [AWS ElastiCache — Getting Started](https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/GettingStarted.html)

### 📖 Persistent File Storage (Amazon EFS)

**What it is:** A network file system that multiple ECS tasks can mount simultaneously. Files persist across task restarts and deployments.

**When to use:** When your app MUST read/write to the filesystem and the data must survive restarts (e.g., your [activity-logs/events.log](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/activity-logs/events.log)).

**What you'd need to do:**

| Step                             | Where                  | What                                                        |
| -------------------------------- | ---------------------- | ----------------------------------------------------------- |
| 1. Create EFS filesystem         | AWS Console            | Put in same VPC                                             |
| 2. Add volume to task definition | [setup-ecs-fargate.sh](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/scripts/aws/setup-ecs-fargate.sh) | Add `volumes` and `mountPoints` to the container definition |
| 3. Configure platform version    | ECS Service            | Must use Fargate platform version `1.4.0+`                  |

### 📖 The Key Pattern

Notice that adding **any** external service to your pipeline follows the same 4-step pattern:

```
1. CREATE the resource          → AWS Console or setup script
2. SECURE the connection        → Security Groups + IAM Roles or Secrets Manager
3. INJECT the connection string → Task Definition (environment or secrets)
4. USE it in your code          → Install SDK/client + connect
```

> [!TIP]
> Once you understand this pattern, you can add **any** AWS service to your deployment. It's always: create → secure → inject → use.

---

| Term                | Plain English                                                |
| ------------------- | ------------------------------------------------------------ |
| **Docker Image**    | A portable package containing your app + everything it needs |
| **Container**       | A running instance of a Docker image                         |
| **ECR**             | AWS's private Docker image storage                           |
| **ECS**             | AWS's service for running containers                         |
| **Fargate**         | Serverless mode for ECS — AWS manages the servers            |
| **Task Definition** | A JSON "recipe" for how to run your container                |
| **Task**            | One running container instance                               |
| **Service**         | Keeps N tasks running and replaces unhealthy ones            |
| **Cluster**         | A group of services                                          |
| **ALB**             | Application Load Balancer — distributes traffic              |
| **Target Group**    | The set of tasks the ALB forwards traffic to                 |
| **ACM**             | AWS Certificate Manager — free SSL certificates              |
| **Route53**         | AWS DNS — maps domain names to IP addresses                  |
| **IAM Role**        | A set of permissions a service can assume                    |
| **Secrets Manager** | Secure storage for API keys/passwords                        |
| **CI/CD**           | Continuous Integration / Continuous Deployment               |
| **Pipeline**        | An automated sequence of build → test → deploy steps         |
| **Pipe**            | A pre-built Bitbucket integration (reusable step)            |

---

## Module 8: Extending the Pipeline — "I Want To Do X"

### 🎯 Goal

Know **exactly which files to edit and what to add** for the most common pipeline extensions. This is your cookbook.

### 📖 Extension Recipes

#### 8.1 — "I want to add a staging environment"

Right now, every push to `main` goes directly to production. A staging environment lets you test in a production-like setup first.

**What to change:**

```yaml
# bitbucket-pipelines.yml — add a new branch trigger
pipelines:
  branches:
    develop: # ← NEW: staging pipeline
      - step:
          name: Build and verify
          script:
            - npm ci --legacy-peer-deps
            - npm run build
      - step:
          name: Build and push Docker image
          services:
            - docker
          script:
            - export IMAGE_TAG=${BITBUCKET_COMMIT}
            - docker build -t ${ECR_REPOSITORY}:staging-${IMAGE_TAG} .
            - pipe: atlassian/aws-ecr-push-image:2.6.0
              variables:
                IMAGE_NAME: $ECR_REPOSITORY
                TAGS: "staging-${IMAGE_TAG} staging-latest"
      - step:
          name: Deploy to Staging ECS
          script:
            - pipe: atlassian/aws-ecs-deploy:1.12.0
              variables:
                CLUSTER_NAME: $ECS_CLUSTER_STAGING # ← different cluster
                SERVICE_NAME: $ECS_SERVICE_STAGING # ← different service
                FORCE_NEW_DEPLOYMENT: "true"
    main:
      # ... existing production pipeline stays unchanged
```

**Also needed:**

- Run [setup-ecs-fargate.sh](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/scripts/aws/setup-ecs-fargate.sh) again with `ECS_CLUSTER=poc-dopamine-staging-cluster`, `ECS_SERVICE=poc-dopamine-staging-service` to create separate staging infrastructure
- Add `ECS_CLUSTER_STAGING` and `ECS_SERVICE_STAGING` as Bitbucket repository variables

> [!NOTE]
> **Concept:** Staging = a copy of production, but with a different URL (e.g., `staging.dopamine.inspirit-nonprod.mml.cloud`). You push to `develop` → staging. When it looks good, you merge `develop` → `main` → production.

---

#### 8.2 — "I want to add automated tests to the pipeline"

**What to change:** Add test commands to Step 1 of [bitbucket-pipelines.yml](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/bitbucket-pipelines.yml):

```yaml
- step:
    name: Build and verify
    caches:
      - node
    script:
      - npm ci --legacy-peer-deps
      - npm run lint # ← ADD: lint check
      - npm run test # ← ADD: run unit tests
      - npm run build
```

**Also needed:** Add a `test` script in [package.json](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/package.json):

```json
"scripts": {
  "test": "jest --ci --coverage",
  "lint": "eslint ."
}
```

> [!TIP]
> The `--ci` flag makes Jest run in CI mode (fails on any test failure, no interactive prompts).

---

#### 8.3 — "I want to add a new environment variable to the running app"

For example, adding a `DATABASE_URL` that the running Next.js app needs.

**Three options, from simplest to most secure:**

| Method              | Where to set it                              | Security                  | Effort  |
| ------------------- | -------------------------------------------- | ------------------------- | ------- |
| Task Definition env | [setup-ecs-fargate.sh](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/scripts/aws/setup-ecs-fargate.sh) → `environment` array | ⚠️ Visible in AWS Console | Easiest |
| Secrets Manager     | Like the existing `OPENAI_KEY` pattern       | ✅ Encrypted              | Medium  |
| Parameter Store     | AWS Systems Manager                          | ✅ Encrypted              | Medium  |

**Option A — Plain environment variable** (for non-sensitive values):

Edit the task definition section in [setup-ecs-fargate.sh](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/scripts/aws/setup-ecs-fargate.sh):

```json
"environment": [
  { "name": "NODE_ENV", "value": "production" },
  { "name": "PORT", "value": "80" },
  { "name": "DATABASE_URL", "value": "postgres://..." }   // ← ADD
]
```

**Option B — Secret in Secrets Manager** (for sensitive values like API keys):

Follow the existing `OPENAI_KEY` pattern in [setup-ecs-fargate.sh](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/scripts/aws/setup-ecs-fargate.sh) — add a new secret to the `secrets` array in the task definition.

---

#### 8.4 — "I want to add a manual approval before deploying to production"

**What to change:** Add a `trigger: manual` to the deploy step:

```yaml
- step:
    name: Deploy to ECS Fargate
    trigger: manual # ← ADD THIS LINE
    script:
      - pipe: atlassian/aws-ecs-deploy:1.12.0
        # ... rest stays the same
```

This means the pipeline will build and push the image automatically, but wait for someone to click "Deploy" in the Bitbucket UI before actually deploying.

---

#### 8.5 — "I want to add Slack/Teams notifications when a deploy succeeds or fails"

**What to change:** Add a notification step at the end of [bitbucket-pipelines.yml](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/bitbucket-pipelines.yml):

```yaml
- step:
    name: Notify team
    script:
      - pipe: atlassian/slack-notify:2.1.0
        variables:
          WEBHOOK_URL: $SLACK_WEBHOOK_URL
          MESSAGE: "✅ Deployment of commit ${BITBUCKET_COMMIT:0:7} to production succeeded!"
```

Add `SLACK_WEBHOOK_URL` as a Bitbucket repository variable.

---

#### 8.6 — "I want to increase the CPU/memory because the app is slow"

**What to change:** In [.env.example](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/infra/ecs/.env.example) (or your actual env file), update:

```bash
export ECS_CPU=1024          # was 512 (0.5 vCPU → 1 vCPU)
export ECS_MEMORY=2048       # was 1024 (1 GB → 2 GB)
```

Then re-run [setup-ecs-fargate.sh](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/scripts/aws/setup-ecs-fargate.sh). ECS will register a new task definition and start new tasks with the updated resources.

> [!WARNING]
> Valid Fargate CPU/memory combinations are specific. For example, 1024 CPU supports 2048–8192 MB memory. See [Fargate Task Size](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/fargate-tasks-services.html#fargate-tasks-size).

---

#### 8.7 — "I want to add a new domain (e.g., custom.example.com)"

**Steps:**

1. Request an ACM certificate for the new domain (use [manage-certificate.sh](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/scripts/aws/manage-certificate.sh) with `DOMAIN_NAME=custom.example.com`)
2. Add the certificate to the ALB listener (the script handles this)
3. Create a Route53 alias record pointing the new domain to the ALB
4. If the domain is outside AWS, add a CNAME record pointing to the ALB's DNS name

---

#### 8.8 — "I want to deploy to multiple regions"

**What to change:** Duplicate the deploy steps with different region variables:

```yaml
- step:
    name: Deploy to US East
    script:
      - pipe: atlassian/aws-ecs-deploy:1.12.0
        variables:
          AWS_DEFAULT_REGION: "us-east-1"
          CLUSTER_NAME: $ECS_CLUSTER_US
          SERVICE_NAME: $ECS_SERVICE_US
- step:
    name: Deploy to EU West
    script:
      - pipe: atlassian/aws-ecs-deploy:1.12.0
        variables:
          AWS_DEFAULT_REGION: "eu-west-1"
          CLUSTER_NAME: $ECS_CLUSTER_EU
          SERVICE_NAME: $ECS_SERVICE_EU
```

**Also needed:** Run [setup-ecs-fargate.sh](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/scripts/aws/setup-ecs-fargate.sh) in each region separately with the appropriate `AWS_DEFAULT_REGION`.

---

#### 8.9 — "I want to run parallel steps to speed up the pipeline"

**What to change:** Use the `parallel` keyword:

```yaml
- parallel:
    - step:
        name: Lint
        script:
          - npm ci --legacy-peer-deps
          - npm run lint
    - step:
        name: Test
        script:
          - npm ci --legacy-peer-deps
          - npm run test
    - step:
        name: Build
        script:
          - npm ci --legacy-peer-deps
          - npm run build
```

This runs lint, test, and build at the same time instead of sequentially.

---

#### 8.10 — "I want to run a database migration before deploying"

**What to change:** Add a step between the Docker push and the ECS deploy:

```yaml
- step:
    name: Run database migrations
    image: node:22
    script:
      - npm ci --legacy-peer-deps
      - npx prisma migrate deploy # or whatever migration tool you use
```

> [!CAUTION]
> Database migrations should always be **backward-compatible** because old containers might still be running during deployment. Don't drop columns that old code still reads!

---

### 📖 Decision Tree: "Which File Do I Edit?"

```mermaid
graph TD
    Q["What do I want to change?"]
    Q --> A["Pipeline behavior\n(when/how to build)"]
    Q --> B["What's inside\nthe Docker image"]
    Q --> C["How the container\nruns on AWS"]
    Q --> D["Network/domain/\nSSL changes"]

    A --> A1["Edit: bitbucket-pipelines.yml"]
    B --> B1["Edit: Dockerfile"]
    C --> C1["Edit: setup-ecs-fargate.sh\nor infra/ecs/.env.example"]
    D --> D1["Edit: setup-ecs-fargate.sh\nor manage-certificate.sh"]

    A1 --> A2["Examples:\n• Add test step\n• Add staging branch\n• Add manual approval\n• Add notifications"]
    B1 --> B2["Examples:\n• Change Node version\n• Add OS packages\n• Change exposed port\n• Add build args"]
    C1 --> C2["Examples:\n• Change CPU/memory\n• Add env vars\n• Change scaling\n• Add secrets"]
    D1 --> D2["Examples:\n• New domain\n• New SSL cert\n• New region\n• Security group rules"]
```

---

## Module 9: Troubleshooting & Debugging Deployments

### 🎯 Goal

Know how to diagnose and fix the most common deployment failures.

### 📖 Common Failure Scenarios

#### 9.1 — Pipeline Step 1 Fails: "Build error"

**Symptom:** `npm run build` fails in the pipeline but works locally.

**Common causes & fixes:**

| Cause                                | Fix                                                                            |
| ------------------------------------ | ------------------------------------------------------------------------------ |
| Missing dependency in [package.json](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/package.json) | You installed it locally with `npm install X` but didn't commit [package.json](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/package.json) |
| Environment variable missing         | Build needs an env var that exists locally but not in the pipeline             |
| TypeScript error ignored locally     | CI runs a stricter build — fix the type error                                  |
| Node version mismatch                | Pipeline uses `node:22` — check your local version with `node -v`              |

**How to debug:**

1. Read the error logs in the Bitbucket Pipelines UI
2. Try to reproduce locally: `docker build -t test .` (this simulates the full pipeline build)

---

#### 9.2 — Pipeline Step 3 Fails: "Docker push failed"

**Symptom:** Image builds but can't be pushed to ECR.

**Common causes & fixes:**

| Cause                        | Fix                                                              |
| ---------------------------- | ---------------------------------------------------------------- |
| AWS credentials expired      | Refresh `AWS_SESSION_TOKEN` in Bitbucket variables               |
| ECR repository doesn't exist | Step 2 may have failed silently — check ECR in AWS Console       |
| ECR permission denied        | IAM user needs `ecr:GetAuthorizationToken`, `ecr:PutImage`, etc. |

---

#### 9.3 — Pipeline Succeeds but App is Down

**Symptom:** Pipeline shows green ✅ but the website returns 502/503.

**How to debug** (in order):

```
1. AWS Console → ECS → Cluster → Service → "Events" tab
   └─ Shows: "service X is unable to consistently start tasks"

2. AWS Console → ECS → Cluster → Service → "Tasks" tab
   └─ Click a STOPPED task → see "Stopped reason"
   └─ Common: "Essential container in task exited" = app crashed on startup

3. AWS Console → CloudWatch → Log Groups → /ecs/poc-dopamine-task
   └─ Find the latest log stream → read the crash logs
   └─ Common: missing env var, port mismatch, out of memory

4. AWS Console → EC2 → Target Groups → poc-dopamine-tg → "Targets" tab
   └─ Shows: "unhealthy" = ALB health check is failing
   └─ Common: app doesn't respond on port 80, or health check path returns non-200
```

**Most common causes:**

| Symptom                     | Likely Cause                             | Fix                                                                 |
| --------------------------- | ---------------------------------------- | ------------------------------------------------------------------- |
| Container exits immediately | Missing env var or crashing on startup   | Check CloudWatch logs, add the env var                              |
| Health check failing        | App not listening on port 80             | Ensure `ENV PORT=80` in Dockerfile and app reads `process.env.PORT` |
| Out of memory               | App exceeds 1024 MB limit                | Increase `ECS_MEMORY` in setup script                               |
| Task stuck in PENDING       | No available Fargate capacity in subnets | Check if subnets have available IPs                                 |

---

#### 9.4 — Deployment Rolled Back Automatically

**Symptom:** ECS shows "deployment circuit breaker triggered, rolling back."

**What happened:** The deployment started new tasks, but they kept failing health checks, so ECS automatically reverted to the previous version.

**How to debug:**

1. Find the **failed task** in ECS (it will be in STOPPED state)
2. Click into it → read the **stopped reason**
3. Check **CloudWatch logs** for that specific task's log stream
4. Fix the issue → push again

---

#### 9.5 — HTTPS Not Working / Certificate Error

**Symptom:** Browser shows "Your connection is not private" or `ERR_CERT_AUTHORITY_INVALID`.

**Common causes:**

| Cause                                 | Fix                                                                |
| ------------------------------------- | ------------------------------------------------------------------ |
| ACM certificate is PENDING_VALIDATION | Run [manage-certificate.sh](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/scripts/aws/manage-certificate.sh) — it creates the DNS record and waits  |
| Wrong certificate on listener         | Check ALB → Listeners → Port 443 → Certificate matches your domain |
| DNS not pointing to ALB               | Check Route53 → the A record alias points to the ALB               |
| Certificate for wrong domain          | Re-request with correct `DOMAIN_NAME`                              |

---

### 📖 Debugging Toolkit

| Tool                            | What It Shows                            | How to Access                                   |
| ------------------------------- | ---------------------------------------- | ----------------------------------------------- |
| **Bitbucket Pipelines UI**      | Pipeline step logs (build output)        | Bitbucket repo → Pipelines tab                  |
| **AWS ECS Console**             | Task status, events, deployment history  | AWS Console → ECS → Clusters                    |
| **CloudWatch Logs**             | Application stdout/stderr (Next.js logs) | AWS Console → CloudWatch → Log Groups           |
| **ALB Target Health**           | Which tasks the ALB considers healthy    | AWS Console → EC2 → Target Groups               |
| **`docker logs`**               | Local container output                   | `docker logs <container-id>`                    |
| **`aws ecs describe-services`** | Service status and recent events (CLI)   | AWS CLI                                         |
| **`aws logs tail`**             | Stream CloudWatch logs in your terminal  | `aws logs tail /ecs/poc-dopamine-task --follow` |

---

## Module 10: What to Learn Next

### 🎯 Goal

Once you've mastered your current pipeline, here's what to explore next to level up.

### 📖 Recommended Next Steps

#### 10.1 — Infrastructure as Code (IaC)

Your current setup uses bash scripts ([setup-ecs-fargate.sh](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/scripts/aws/setup-ecs-fargate.sh)). This works, but professional teams use dedicated IaC tools:

| Tool               | What It Does                                                               | Difficulty         |
| ------------------ | -------------------------------------------------------------------------- | ------------------ |
| **Terraform**      | Define all AWS resources in `.tf` files. Version-controlled, reproducible. | ⭐⭐⭐ Medium      |
| **AWS CDK**        | Define AWS resources in TypeScript/Python code.                            | ⭐⭐ Medium        |
| **CloudFormation** | AWS's native IaC in YAML/JSON.                                             | ⭐⭐⭐ Medium-Hard |
| **Pulumi**         | Like Terraform but uses real programming languages.                        | ⭐⭐⭐ Medium      |

> [!TIP]
> **Start with Terraform.** It's the industry standard, works with any cloud provider, and has the best learning resources. Your [setup-ecs-fargate.sh](file:///c:/Users/vnsvg/Desktop/projects/Macmillan/blr-dopamine-backend/scripts/aws/setup-ecs-fargate.sh) would become a set of `.tf` files that are easier to read, version, and modify.

**Resources:**

- [Terraform — Getting Started](https://developer.hashicorp.com/terraform/tutorials/aws-get-started)
- [Terraform ECS Fargate Example](https://developer.hashicorp.com/terraform/tutorials/aws/ecs-deploy)

---

#### 10.2 — Container Orchestration Beyond ECS

| Platform             | When to Use                                                 |
| -------------------- | ----------------------------------------------------------- |
| **Kubernetes (K8s)** | Large-scale, multi-service applications. Industry standard. |
| **AWS EKS**          | Managed Kubernetes on AWS.                                  |
| **Google Cloud Run** | Simplest serverless container platform.                     |
| **Docker Compose**   | Multi-container local development (not production).         |

Your current ECS Fargate setup is perfectly fine for a single-service app. Kubernetes is worth learning if you'll work on larger projects with many microservices.

---

#### 10.3 — Monitoring & Observability

Right now your pipeline deploys and hopes for the best. Add monitoring to _know_ when things go wrong:

| Tool                    | What It Does                                                                 |
| ----------------------- | ---------------------------------------------------------------------------- |
| **CloudWatch Alarms**   | Alert when CPU > 80%, error rate > 5%, etc.                                  |
| **AWS X-Ray**           | Trace individual requests through your app                                   |
| **Datadog / New Relic** | Full observability platform (logs, metrics, traces)                          |
| **Uptime monitoring**   | Ping your URL every minute, alert if it's down (e.g., Uptime Robot, Pingdom) |

---

#### 10.4 — Security Hardening

| Topic                   | What to Learn                                                                                   |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| **IAM least privilege** | Don't use admin credentials in CI — create a dedicated CI user with only the needed permissions |
| **Container scanning**  | ECR has built-in `scanOnPush=true` (you already have this!) — learn to read the scan results    |
| **Secrets rotation**    | Automatically rotate Secrets Manager secrets periodically                                       |
| **Network isolation**   | Private subnets for ECS tasks (traffic goes through NAT gateway, not directly to internet)      |
| **OIDC for CI**         | Replace long-lived AWS keys with short-lived OIDC tokens from Bitbucket                         |

---

#### 10.5 — Advanced CI/CD Patterns

| Pattern                   | What It Is                                                              |
| ------------------------- | ----------------------------------------------------------------------- |
| **Blue/Green deployment** | Run old and new version side by side, switch traffic instantly          |
| **Canary deployment**     | Send 5% of traffic to the new version first, then gradually increase    |
| **Feature flags**         | Enable/disable features without deploying (e.g., LaunchDarkly)          |
| **GitOps**                | Infrastructure changes are made via Git PRs, not scripts (e.g., ArgoCD) |
| **Monorepo pipelines**    | Only build/deploy services that actually changed                        |

---

## 🎓 Suggested Learning Order (Updated)

```mermaid
graph TD
    M1["Module 1\nDocker"] --> M2["Module 2\nCI/CD Concepts"]
    M2 --> M3["Module 3\nBitbucket Pipelines"]
    M1 --> M4["Module 4\nIAM & ECR"]
    M4 --> M5["Module 5\nECS Fargate"]
    M3 --> M7["Module 7\nEnd-to-End"]
    M5 --> M6["Module 6\nALB + HTTPS + DNS"]
    M6 --> M7
    M7 --> M8["Module 8\nExtending the Pipeline"]
    M7 --> M9["Module 9\nTroubleshooting"]
    M8 --> M10["Module 10\nWhat to Learn Next"]
    M9 --> M10

    style M8 fill:#2d6a4f,stroke:#1b4332,color:#fff
    style M9 fill:#9d4edd,stroke:#7b2cbf,color:#fff
    style M10 fill:#e76f51,stroke:#d62828,color:#fff
```

> [!TIP]
> **Modules 1–7** teach you to _understand_ the pipeline.
> **Module 8** teaches you to _extend_ it confidently.
> **Module 9** teaches you to _fix_ it when things break.
> **Module 10** shows you where to go _after_ you've mastered all of this.
