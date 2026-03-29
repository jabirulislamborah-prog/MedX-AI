from playwright.sync_api import sync_playwright
import sys

url = sys.argv[1] if len(sys.argv) > 1 else 'https://med-x-ai-eight.vercel.app/'

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 390, "height": 844})  # iPhone 14 size
    
    print(f"Navigating to {url}...")
    page.goto(url, wait_until='networkidle', timeout=30000)
    page.wait_for_timeout(3000)
    
    # Take screenshot
    page.screenshot(path='/tmp/vercel_check.png', full_page=True)
    print("Screenshot saved to /tmp/vercel_check.png")
    
    # Get page title and content
    print(f"Title: {page.title()}")
    
    # Check for gamification elements
    content = page.content()
    
    # Check for new elements we added
    checks = [
        ('level-badge', 'Level badge class'),
        ('hearts-container', 'Hearts container'),
        ('xp-bar-glow', 'XP bar glow'),
        ('streak-fire', 'Streak fire animation'),
        ('Confetti', 'Confetti system'),
        ('duolingo', 'Duolingo references'),
        ('Daily Goal', 'Daily goals widget'),
    ]
    
    for keyword, name in checks:
        found = keyword.lower() in content.lower()
        print(f"  {'✅' if found else '❌'} {name}: {'Found' if found else 'Not found'}")
    
    # Check login page vs dashboard redirect
    print(f"\nURL: {page.url}")
    
    # Check for specific new elements on home page
    print("\nChecking home page elements...")
    try:
        # Look for new gamification elements
        h1_text = page.locator('h1').first.inner_text()
        print(f"H1: {h1_text}")
    except:
        print("Could not find H1")
    
    browser.close()