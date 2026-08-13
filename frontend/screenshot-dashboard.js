import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  
  // Set auth tokens to bypass login wall
  await context.addInitScript(() => {
    window.localStorage.setItem('access_token', 'dummy_token_123');
    window.localStorage.setItem('user_role', 'EMPLOYEE');
  });

  const page = await context.newPage();
  
  // Mock API calls so dashboard renders with beautiful data
  await page.route('**/api/auth/user/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ username: "EMPLOYEE_jane", role: "EMPLOYEE", email: "jane@skillstream.com" })
    });
  });

  await page.route('**/api/courses/my_workspace/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        count: 3,
        results: [
          {
            id: 1,
            title: "Advanced React & Next.js Architecture",
            category: "Frontend Web Development",
            difficulty: "ADVANCED",
            validity_days: 30,
            thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80",
            EMPLOYEE_username: "EMPLOYEE_jane"
          },
          {
            id: 2,
            title: "Data Science & Machine Learning",
            category: "Data Science",
            difficulty: "INTERMEDIATE",
            validity_days: 60,
            thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee57d5?auto=format&fit=crop&w=800&q=80",
            EMPLOYEE_username: "EMPLOYEE_jane"
          },
          {
            id: 3,
            title: "Backend Scalability Workshop",
            category: "Backend Development",
            difficulty: "BEGINNER",
            validity_days: 15,
            thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
            EMPLOYEE_username: "EMPLOYEE_jane"
          }
        ]
      })
    });
  });

  console.log("Navigating to /dashboard...");
  await page.goto('http://localhost:5173/dashboard');
  
  // Wait for initial load and animations
  await page.waitForTimeout(3000);
  
  console.log("Capturing Dashboard Light Theme...");
  await page.screenshot({ path: 'dashboard-light.png', fullPage: true });
  
  console.log("Toggling dark theme...");
  // Try to find the dark mode toggle button in the layout header
  // It's the button with the Sun/Moon icon in the AppLayout navbar.
  // We can just inject the .dark class directly to be absolutely sure.
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-bs-theme', 'dark');
  });
  await page.waitForTimeout(1000);
  
  console.log("Capturing Dashboard Dark Theme...");
  await page.screenshot({ path: 'dashboard-dark.png', fullPage: true });
  
  await browser.close();
  console.log("Dashboard Screenshots Done!");
})();
