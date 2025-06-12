// Simple router for the SupiriAccounts PWA
class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.rootElement = document.getElementById('main-content');
        
        // Initialize event listeners
        window.addEventListener('hashchange', this.handleRouteChange.bind(this));
        window.addEventListener('DOMContentLoaded', this.handleRouteChange.bind(this));
    }
    
    // Add a new route
    addRoute(path, controller) {
        this.routes[path] = controller;
        return this;
    }
    
    // Handle route changes
    async handleRouteChange() {
        // Get the current hash or default to home
        const path = window.location.hash.slice(1) || '/';
        
        // Find the route controller
        const routeHandler = this.matchRoute(path);
        
        if (routeHandler) {
            this.currentRoute = path;
            
            // Show loading indicator
            this.rootElement.innerHTML = `
                <div class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Loading...</p>
                </div>
            `;
            
            try {
                // Call the route controller and update content
                const content = await routeHandler();
                this.rootElement.innerHTML = content;
                
                // Initialize any scripts needed for this view
                this.initViewScripts();
                
                // Update active navigation
                this.updateNavigation();
                
                // Scroll to top
                window.scrollTo(0, 0);
            } catch (error) {
                console.error('Error loading route:', error);
                this.rootElement.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        <h4 class="alert-heading">Error!</h4>
                        <p>Failed to load the requested page.</p>
                        <hr>
                        <p class="mb-0">Please try again or contact support.</p>
                    </div>
                `;
            }
        } else {
            // Handle 404 - route not found
            this.rootElement.innerHTML = `
                <div class="alert alert-warning" role="alert">
                    <h4 class="alert-heading">Page Not Found</h4>
                    <p>The page you requested could not be found.</p>
                    <hr>
                    <p class="mb-0">
                        <a href="#/" class="alert-link">Return to Home</a>
                    </p>
                </div>
            `;
        }
    }
      // Match route pattern against registered routes
    matchRoute(path) {
        // First try direct match
        if (this.routes[path]) {
            return () => this.routes[path]();
        }
        
        // Try to match dynamic routes with parameters
        for (const routePath in this.routes) {
            // Check if route has parameters
            if (routePath.includes(':')) {
                const routeParts = routePath.split('/');
                const pathParts = path.split('/');
                
                // If different length, not a match
                if (routeParts.length !== pathParts.length) {
                    continue;
                }
                
                let isMatch = true;
                const params = {};
                
                // Compare each part
                for (let i = 0; i < routeParts.length; i++) {
                    if (routeParts[i].startsWith(':')) {
                        // This is a parameter
                        const paramName = routeParts[i].slice(1);
                        params[paramName] = pathParts[i];
                    } else if (routeParts[i] !== pathParts[i]) {
                        isMatch = false;
                        break;
                    }
                }
                
                if (isMatch) {
                    return () => this.routes[routePath](params);
                }
            }
        }
        
        // No match found
        return null;
    }
    
    // Update navigation to highlight current route
    updateNavigation() {
        const navLinks = document.querySelectorAll('#main-nav .nav-link');
        navLinks.forEach(link => {
            const linkPath = link.getAttribute('href').slice(1);
            if (linkPath === this.currentRoute) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    // Initialize any scripts needed for the current view
    initViewScripts() {
        // Find and execute any script tags in the loaded content
        const scripts = this.rootElement.querySelectorAll('script');
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            
            // Copy all attributes
            Array.from(script.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });
            
            // Copy content
            newScript.textContent = script.textContent;
            
            // Replace the old script with the new one
            script.parentNode.replaceChild(newScript, script);
        });
    }
    
    // Navigate to a specific route programmatically
    navigateTo(path) {
        window.location.hash = path;
    }
}

// Create global router instance
const router = new Router();
