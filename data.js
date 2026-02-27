// Attach to window so it's globally accessible
window.techniques = [
    {
        title: "Explain Like I'm 5",
        content: `
            <h3>The Big Box of Toys (Docker)</h3>
            <p>Imagine you have a super cool box of toys (your app). You want to show it to your friend, but their room is messy and they don't have the same batteries you do. So, you put your toys, the batteries, and even the instructions inside a magical <strong>Lunchbox</strong> (Container).</p>
            <p>Now, no matter whose house you go to, you just open the lunchbox and play exactly the same way!</p>

            <h3>The Conveyor Belt (CI/CD Pipeline)</h3>
            <p>Think of a factory that makes toy cars. </p>
            <ol>
                <li><strong>You (The Builder):</strong> You design a new wheel.</li>
                <li><strong>The Robot (CI):</strong> A robot checks if the wheel fits. If it's too square, the robot beeps "BEEP! WRONG!" (Build fails).</li>
                <li><strong>The Truck (CD):</strong> If the wheel is perfect, the robot puts it on a truck and drives it to the toy store (AWS) automatically.</li>
            </ol>
            <p>This way, you never have to drive the truck yourself, and broken toys never get to the store!</p>
        `
    },
    {
        title: "Examples & Analogies",
        content: `
            <h3>1. The Shipping Container (Docker)</h3>
            <p><strong>Concept:</strong> Portability & Isolation.</p>
            <p><strong>Analogy:</strong> Before shipping containers, ships had to load barrels, sacks, and boxes separately. It was messy. Docker is like a standard steel shipping container. It doesn't matter if it holds cars or bananas; the crane (AWS ECS) picks it up the same way.</p>

            <h3>2. The Traffic Cop (Load Balancer)</h3>
            <p><strong>Concept:</strong> Distribution.</p>
            <p><strong>Analogy:</strong> Imagine a busy intersection. The Load Balancer is the police officer blowing the whistle. "You, go to Lane 1 (Server 1)! You, go to Lane 2 (Server 2)!" If Lane 1 has a pothole (Server crash), the cop directs everyone to Lane 2 so traffic keeps moving.</p>

            <h3>3. The Recipe Card (Task Definition)</h3>
            <p><strong>Concept:</strong> Configuration.</p>
            <p><strong>Analogy:</strong> A Docker Image is the <em>ingredients</em>. The Task Definition is the <em>recipe card</em>. It tells the chef (ECS) "Use 2 cups of CPU, 1 cup of RAM, and bake at port 80."</p>
        `
    },
    {
        title: "Motivation Boost",
        content: `
            <h3>Strategies to Stay on Track</h3>
            <p>Learning deployment pipelines can feel overwhelming. Here is how to beat the slump:</p>
            <ul>
                <li><strong>1. The "10-Minute Rule":</strong> Don't want to study? Just commit to 10 minutes. Usually, you'll keep going. If not, at least you did 10 minutes.</li>
                <li><strong>2. Celebrate "Green Builds":</strong> Every time your pipeline passes (turns green), give yourself a mini-reward (a snack, a stretch, a victory dance). Dopamine hacking!</li>
                <li><strong>3. Visualize the "Magic":</strong> Remember the end goal: You push code, and minutes later it's live on the internet. That is a superpower.</li>
                <li><strong>4. Break it Down:</strong> Don't try to "Learn AWS". Today, just learn "What is a Bucket?". Small wins build momentum.</li>
                <li><strong>5. Find a "Buddy":</strong> Explain what you learned to a rubber duck (or a real friend). Teaching it cements it.</li>
            </ul>
        `
    },
    {
        title: "Role-Play Scenario",
        renderer: "renderRolePlay", // Use string name for global function
        content: [
            { role: "Junior Dev", text: "Hey! I pushed my code to main, but the site is down! What happened?" },
            { role: "Senior DevOps", text: "Don't panic. First, did you check the pipeline status in Bitbucket?" },
            { role: "Junior Dev", text: "Uh, no. I just assumed it worked. Let me check... It says 'Failed' on Step 3." },
            { role: "Senior DevOps", text: "Step 3 is 'Build Docker Image'. Click the logs. What's the error message?" },
            { role: "Junior Dev", text: "It says... 'COPY failed: file not found: package-lock.json'. Oops." },
            { role: "Senior DevOps", text: "Aha! You forgot to commit the lock file. The Dockerfile needs it to install dependencies cleanly. Add it and push again." },
            { role: "Junior Dev", text: "Pushing now... Watching the pipeline... Step 3 passed! It's deploying!" },
            { role: "Senior DevOps", text: "Great job debugging. Always check the logs first!" }
        ]
    },
    {
        title: "Custom Study Plan",
        renderer: "renderStudyPlan",
        content: [
            {
                week: "Week 1: Fundamentals",
                tasks: ["Read Module 1: Docker", "Install Docker Desktop", "Build 'Hello World' container", "Read Module 2: CI/CD Basics"]
            },
            {
                week: "Week 2: AWS Core",
                tasks: ["Read Module 3: Bitbucket Pipelines", "Read Module 4: IAM & ECR", "Create AWS Free Tier Account", "Push first image to ECR"]
            },
            {
                week: "Week 3: The Heavy Lifting",
                tasks: ["Read Module 5: ECS Fargate", "Read Module 6: Networking (ALB/DNS)", "Run the setup script", "Verify the Load Balancer"]
            },
            {
                week: "Week 4: Mastery",
                tasks: ["Module 7: End-to-End Test", "Module 8: Extending (Add a Staging env)", "Module 9: Break it & Fix it", "Final Review"]
            }
        ]
    },
    {
        title: "Quiz Generator",
        renderer: "renderQuiz",
        content: [
            {
                question: "What does Docker use to package an application?",
                options: ["Virtual Machines", "Containers", "Hypervisors", "Bare Metal"],
                correct: 1,
                explanation: "Docker uses <strong>Containers</strong>, which are lightweight and share the host OS kernel."
            },
            {
                question: "Which AWS service is used to store Docker images?",
                options: ["S3", "EC2", "ECR", "Lambda"],
                correct: 2,
                explanation: "<strong>ECR (Elastic Container Registry)</strong> is AWS's Docker Hub."
            },
            {
                question: "What triggers a CI/CD pipeline typically?",
                options: ["A full moon", "A git push", "Restarting the server", "Deleting a file"],
                correct: 1,
                explanation: "Pipelines are usually triggered by a <strong>git push</strong> to a repository."
            },
            {
                question: "What is Fargate?",
                options: ["A database", "A load balancer", "Serverless compute engine for containers", "A file storage system"],
                correct: 2,
                explanation: "<strong>Fargate</strong> runs containers without you needing to manage the underlying servers."
            },
            {
                question: "What is the purpose of a Load Balancer (ALB)?",
                options: ["To store data", "To distribute traffic across multiple tasks", "To build the code", "To encrypt the database"],
                correct: 1,
                explanation: "An ALB distributes incoming traffic to multiple targets (tasks) to ensure availability."
            },
            {
                question: "Why use multi-stage builds in Docker?",
                options: ["To make the image larger", "To confuse developers", "To keep the final image small", "To run faster on Windows"],
                correct: 2,
                explanation: "Multi-stage builds allow you to discard build tools and keep only the compiled application."
            },
            {
                question: "What does 'npm ci' do?",
                options: ["Installs packages from package-lock.json cleanly", "Creates a new project", "Compiles images", "Checks internet connection"],
                correct: 0,
                explanation: "<strong>npm ci</strong> performs a clean install based strictly on the lock file, ideal for CI environments."
            },
            {
                question: "What is a 'Task Definition' in ECS?",
                options: ["A to-do list for developers", "A blueprint for your application container", "A log file", "A network rule"],
                correct: 1,
                explanation: "A Task Definition is a blueprint describing the Docker image, CPU, memory, and ports."
            },
            {
                question: "Where should you store API keys?",
                options: ["In the code", "In the Dockerfile", "In Environment Variables / Secrets Manager", "On a sticky note"],
                correct: 2,
                explanation: "Never hardcode secrets. Use <strong>Environment Variables</strong> or a Secrets Manager."
            },
            {
                question: "What happens during a Rolling Deployment?",
                options: ["All servers stop at once", "New versions replace old ones gradually", "The database is deleted", "The internet breaks"],
                correct: 1,
                explanation: "Rolling deployments replace instances of the old version with the new one incrementally to avoid downtime."
            }
        ]
    },
    {
        title: "Mind Mapping",
        renderer: "renderMindMap",
        content: `
graph LR
    A["Developer"] -->|git push| B["Bitbucket Pipeline"]
    B -->|1. Build App| C["npm run build"]
    B -->|2. Build Image| D["docker build"]
    D -->|Push Image| E["AWS ECR (Registry)"]
    E -->|Pull Image| F["AWS ECS (Fargate)"]
    G["User"] -->|HTTPS Request| H["ALB (Load Balancer)"]
    H -->|Forward Traffic| F
    style B fill:#f9f,stroke:#333,stroke-width:2px
    style F fill:#bbf,stroke:#333,stroke-width:2px
    style H fill:#bfb,stroke:#333,stroke-width:2px
        `
    },
    {
        title: "Expert Roundtable",
        renderer: "renderExpertRoundtable",
        content: [
            {
                name: "Sarah (Security)",
                role: "The Paranoiac",
                avatar: "🛡️",
                text: "My biggest concern here is the IAM roles. Are we giving the ECS task too much power? It should only access the specific S3 bucket it needs, nothing else. Least Privilege Principle!"
            },
            {
                name: "Mike (DevOps)",
                role: "The Speedster",
                avatar: "⚡",
                text: "Relax, Sarah. We're using Fargate, so the attack surface is smaller. My focus is the pipeline speed. That \`npm install\` takes 4 minutes! We need to cache the \`node_modules\` better."
            },
            {
                name: "Alex (Manager)",
                role: "The Budget Keeper",
                avatar: "💰",
                text: "Speed is good, but Fargate is expensive if we leave it running 24/7. Can we scale down to 0 at night? Or maybe use Spot Instances for the non-production environments?"
            },
            {
                name: "Sarah (Security)",
                role: "The Paranoiac",
                avatar: "🛡️",
                text: "Scaling to 0 is fine, but don't use Spot for the database! And make sure those secrets aren't in plaintext in the Task Definition!"
            }
        ]
    },
    {
        title: "Mental Associations",
        content: `
            <h3>Mnemonics for Remembering</h3>

            <h4>1. The 3 Steps of CI/CD: "B.T.D."</h4>
            <p><strong>B</strong>uild (Compile it)</p>
            <p><strong>T</strong>est (Verify it)</p>
            <p><strong>D</strong>eploy (Ship it)</p>
            <p><em>"Better To Do" it right than fix it later!</em></p>

            <h4>2. ECS Hierarchy: "C.S.T."</h4>
            <p><strong>C</strong>luster (The Neighborhood)</p>
            <p><strong>S</strong>ervice (The House Manager)</p>
            <p><strong>T</strong>ask (The Worker inside)</p>

            <h4>3. Docker Commands: "B.R.P."</h4>
            <p><strong>B</strong>uild (Make the image)</p>
            <p><strong>R</strong>un (Start the container)</p>
            <p><strong>P</strong>ush (Upload to registry)</p>
            <p><em>"Burp" - Excuse me!</em></p>
        `
    },
    {
        title: "Improve Your Work",
        content: `
            <h3>Critiquing a Dockerfile</h3>
            <p><strong>Original (The "Bad" Version):</strong></p>
            <pre>
FROM node:18
COPY . .
RUN npm install
CMD ["npm", "start"]
            </pre>
            <p><strong>Critique:</strong></p>
            <ul>
                <li>❌ Copies <em>everything</em> before installing. If you change one line of code, it re-installs all dependencies! (Slow)</li>
                <li>❌ Uses the heavy base image.</li>
                <li>❌ No build step for production.</li>
            </ul>

            <p><strong>Improved (The "Pro" Version):</strong></p>
            <pre>
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci               <-- 1. Faster, clean install
COPY . .
RUN npm run build        <-- 2. Create production build

# Stage 2: Run
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
CMD ["npm", "start"]
            </pre>
            <p><strong>Why it's better:</strong></p>
            <ul>
                <li>✅ <strong>Multi-stage:</strong> The final image is tiny because it doesn't have the source code, only the build output.</li>
                <li>✅ <strong>Layer Caching:</strong> \`COPY package*.json\` is separate, so we only re-install if dependencies change.</li>
            </ul>
        `
    }
];

// --- Renderers (Attached to window so they are globally available) ---

window.renderRolePlay = function(tech, container) {
    const wrapper = document.createElement('div');
    wrapper.className = 'role-play-container';

    tech.content.forEach(line => {
        const bubble = document.createElement('div');
        bubble.className = \`chat-bubble \${line.role === 'Junior Dev' ? 'speaker-1' : 'speaker-2'}\`;

        const name = document.createElement('strong');
        name.textContent = line.role + ': ';

        const text = document.createElement('span');
        text.textContent = line.text;

        bubble.appendChild(name);
        bubble.appendChild(text);
        wrapper.appendChild(bubble);
    });

    container.appendChild(wrapper);
}

window.renderStudyPlan = function(tech, container) {
    tech.content.forEach((week, i) => {
        const weekDiv = document.createElement('div');
        weekDiv.className = 'study-plan-week';

        const title = document.createElement('h4');
        title.textContent = week.week;
        weekDiv.appendChild(title);

        week.tasks.forEach(task => {
            const label = document.createElement('label');
            label.className = 'checklist-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';

            // Simple local storage persistence key
            const storageKey = \`task-\${i}-\${task.replace(/\s+/g, '').substring(0, 10)}\`;
            if (localStorage.getItem(storageKey) === 'true') {
                checkbox.checked = true;
            }

            checkbox.onchange = () => {
                localStorage.setItem(storageKey, checkbox.checked);
            };

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(task));
            weekDiv.appendChild(label);
        });

        container.appendChild(weekDiv);
    });
}

window.renderQuiz = function(tech, container) {
    let score = 0;

    tech.content.forEach((q, index) => {
        const qDiv = document.createElement('div');
        qDiv.className = 'quiz-question';

        const title = document.createElement('p');
        title.innerHTML = \`<strong>Q\${index + 1}:</strong> \${q.question}\`;
        qDiv.appendChild(title);

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'quiz-options';

        const nameAttr = \`q\${index}\`;

        // Store references to radio buttons to disable them later
        const radioButtons = [];

        q.options.forEach((opt, optIndex) => {
            const label = document.createElement('label');
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = nameAttr;
            radio.value = optIndex;
            radioButtons.push(radio);

            label.appendChild(radio);
            label.appendChild(document.createTextNode(opt));
            optionsDiv.appendChild(label);
        });

        qDiv.appendChild(optionsDiv);

        const checkBtn = document.createElement('button');
        checkBtn.className = 'check-answer-btn';
        checkBtn.textContent = 'Check Answer';

        const feedback = document.createElement('p');
        feedback.className = 'feedback';

        checkBtn.onclick = () => {
            const selected = document.querySelector(\`input[name="\${nameAttr}"]:checked\`);
            if (!selected) {
                feedback.textContent = "Please select an answer.";
                feedback.className = 'feedback incorrect';
                return;
            }

            const val = parseInt(selected.value);
            if (val === q.correct) {
                feedback.innerHTML = "Correct! " + q.explanation;
                feedback.className = 'feedback correct';
                score++;
            } else {
                feedback.innerHTML = "Incorrect. " + q.explanation;
                feedback.className = 'feedback incorrect';
            }

            // Disable inputs after checking
            radioButtons.forEach(input => input.disabled = true);
            checkBtn.disabled = true;
        };

        qDiv.appendChild(checkBtn);
        qDiv.appendChild(feedback);
        container.appendChild(qDiv);
    });
}

window.renderMindMap = function(tech, container) {
    const mermaidDiv = document.createElement('div');
    mermaidDiv.className = 'mermaid';
    mermaidDiv.textContent = tech.content;
    container.appendChild(mermaidDiv);

    // Re-initialize mermaid
    if (typeof mermaid !== 'undefined') {
        mermaid.init(undefined, mermaidDiv);
    }
}

window.renderExpertRoundtable = function(tech, container) {
    const wrapper = document.createElement('div');

    tech.content.forEach(expert => {
        const card = document.createElement('div');
        card.className = 'expert-card';

        const header = document.createElement('div');
        header.className = 'expert-header';

        const avatar = document.createElement('span');
        avatar.className = 'expert-avatar';
        avatar.textContent = expert.avatar;

        const info = document.createElement('span');
        info.innerHTML = \`\${expert.name} <span style="font-weight:normal; color:#666">(\${expert.role})</span>\`;

        header.appendChild(avatar);
        header.appendChild(info);

        const text = document.createElement('p');
        text.style.marginTop = '10px';
        text.textContent = expert.text;

        card.appendChild(header);
        card.appendChild(text);
        wrapper.appendChild(card);
    });

    container.appendChild(wrapper);
}
