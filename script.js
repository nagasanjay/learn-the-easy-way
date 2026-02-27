document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded (v3)');
    const nav = document.getElementById('technique-nav');
    const title = document.getElementById('technique-title');
    const contentArea = document.getElementById('content-area');

    // Access techniques from window object (set in data.js)
    const techniques = window.techniques;

    console.log('Techniques found:', techniques ? techniques.length : 0);

    // Load navigation items
    if (techniques && techniques.length > 0) {
        techniques.forEach((tech, index) => {
            const btn = document.createElement('button');
            btn.textContent = tech.title;
            btn.onclick = () => loadContent(index);
            nav.appendChild(btn);
            console.log('Button appended:', tech.title);
        });

        // Load first technique by default
        loadContent(0);
    } else {
        contentArea.innerHTML = '<p>Error: Content data not found.</p>';
        console.error('Techniques data not found on window object.');
    }

    function loadContent(index) {
        console.log('Loading content:', index);
        const tech = techniques[index];
        title.textContent = tech.title;
        contentArea.innerHTML = ''; // Clear previous content

        // Add 'active' class to current nav button
        Array.from(nav.children).forEach((child, i) => {
            child.classList.toggle('active', i === index);
        });

        // Render content based on type
        let renderer = renderDefault;

        if (typeof tech.renderer === 'function') {
            renderer = tech.renderer;
        } else if (typeof tech.renderer === 'string' && typeof window[tech.renderer] === 'function') {
            renderer = window[tech.renderer];
        }

        renderer(tech, contentArea);
    }

    function renderDefault(tech, container) {
        if (tech.content) {
            const contentDiv = document.createElement('div');
            contentDiv.innerHTML = tech.content; // Allow HTML in content
            container.appendChild(contentDiv);
        }
    }
});
