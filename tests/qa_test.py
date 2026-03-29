#!/usr/bin/env python3
"""MedX AI - Comprehensive QA Test Suite"""

from playwright.sync_api import sync_playwright, expect
import sys

BASE_URL = "https://med-x-ai-eight.vercel.app"

def test_homepage():
    """Test 1: Homepage loads correctly"""
    print("\n[TEST 1] Homepage Loading...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        page.goto(BASE_URL)
        page.wait_for_load_state('networkidle')
        
        title = page.title()
        print(f"  Page title: {title}")
        
        # Check for main elements
        hero_text = page.locator('h1').first.text_content()
        print(f"  Hero text: {hero_text[:50]}...")
        
        # Check navigation
        login_link = page.locator('a:has-text("Login")').count()
        signup_link = page.locator('a:has-text("Sign Up")').count()
        
        print(f"  Login link present: {login_link > 0}")
        print(f"  Signup link present: {signup_link > 0}")
        
        # Take screenshot
        page.screenshot(path='/tmp/medx-homepage.png', full_page=True)
        print("  Screenshot: /tmp/medx-homepage.png")
        
        browser.close()
    return True

def test_login_page():
    """Test 2: Login page loads"""
    print("\n[TEST 2] Login Page...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        page.goto(f"{BASE_URL}/login")
        page.wait_for_load_state('networkidle')
        
        # Check for email/password fields
        email_input = page.locator('input[type="email"]').count()
        password_input = page.locator('input[type="password"]').count()
        
        print(f"  Email input present: {email_input > 0}")
        print(f"  Password input present: {password_input > 0}")
        
        page.screenshot(path='/tmp/medx-login.png', full_page=True)
        print("  Screenshot: /tmp/medx-login.png")
        
        browser.close()
    return True

def test_signup_page():
    """Test 3: Signup page loads"""
    print("\n[TEST 3] Signup Page...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        page.goto(f"{BASE_URL}/signup")
        page.wait_for_load_state('networkidle')
        
        # Check for form fields
        name_input = page.locator('input[name="full_name"]').count()
        email_input = page.locator('input[type="email"]').count()
        
        print(f"  Name input present: {name_input > 0}")
        print(f"  Email input present: {email_input > 0}")
        
        page.screenshot(path='/tmp/medx-signup.png', full_page=True)
        print("  Screenshot: /tmp/medx-signup.png")
        
        browser.close()
    return True

def test_upload_page():
    """Test 4: Upload page loads"""
    print("\n[TEST 4] Upload Page...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        page.goto(f"{BASE_URL}/upload")
        page.wait_for_load_state('networkidle')
        
        # Check for upload elements
        file_input = page.locator('input[type="file"]').count()
        drag_drop = page.locator('text=Drag').count()
        
        print(f"  File input present: {file_input > 0}")
        print(f"  Drag & drop area: {drag_drop > 0}")
        
        page.screenshot(path='/tmp/medx-upload.png', full_page=True)
        print("  Screenshot: /tmp/medx-upload.png")
        
        browser.close()
    return True

def test_qbank_page():
    """Test 5: QBank page loads"""
    print("\n[TEST 5] QBank Page...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        page.goto(f"{BASE_URL}/qbank")
        page.wait_for_load_state('networkidle')
        
        # Check for QBank elements
        heading = page.locator('h1').first.text_content()
        print(f"  Heading: {heading[:50]}...")
        
        page.screenshot(path='/tmp/medx-qbank.png', full_page=True)
        print("  Screenshot: /tmp/medx-qbank.png")
        
        browser.close()
    return True

def test_flashcards_page():
    """Test 6: Flashcards page loads"""
    print("\n[TEST 6] Flashcards Page...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        page.goto(f"{BASE_URL}/flashcards")
        page.wait_for_load_state('networkidle')
        
        heading = page.locator('h1').first.text_content()
        print(f"  Heading: {heading[:50]}...")
        
        page.screenshot(path='/tmp/medx-flashcards.png', full_page=True)
        print("  Screenshot: /tmp/medx-flashcards.png")
        
        browser.close()
    return True

def test_battle_page():
    """Test 7: Battle page loads"""
    print("\n[TEST 7] Battle Page...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        page.goto(f"{BASE_URL}/battle")
        page.wait_for_load_state('networkidle')
        
        heading = page.locator('h1').first.text_content()
        print(f"  Heading: {heading[:50]}...")
        
        page.screenshot(path='/tmp/medx-battle.png', full_page=True)
        print("  Screenshot: /tmp/medx-battle.png")
        
        browser.close()
    return True

def test_leaderboard_page():
    """Test 8: Leaderboard page loads"""
    print("\n[TEST 8] Leaderboard Page...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        page.goto(f"{BASE_URL}/leaderboard")
        page.wait_for_load_state('networkidle')
        
        heading = page.locator('h1').first.text_content()
        print(f"  Heading: {heading[:50]}...")
        
        page.screenshot(path='/tmp/medx-leaderboard.png', full_page=True)
        print("  Screenshot: /tmp/medx-leaderboard.png")
        
        browser.close()
    return True

def test_tutor_page():
    """Test 9: AI Tutor page loads"""
    print("\n[TEST 9] AI Tutor Page...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        page.goto(f"{BASE_URL}/tutor")
        page.wait_for_load_state('networkidle')
        
        # Check for chat elements
        chat_input = page.locator('textarea').count()
        send_button = page.locator('button:has-text("Send")').count()
        
        print(f"  Chat input present: {chat_input > 0}")
        print(f"  Send button present: {send_button > 0}")
        
        page.screenshot(path='/tmp/medx-tutor.png', full_page=True)
        print("  Screenshot: /tmp/medx-tutor.png")
        
        browser.close()
    return True

def test_pricing_page():
    """Test 10: Pricing page loads"""
    print("\n[TEST 10] Pricing Page...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        page.goto(f"{BASE_URL}/pricing")
        page.wait_for_load_state('networkidle')
        
        heading = page.locator('h1').first.text_content()
        print(f"  Heading: {heading[:50]}...")
        
        # Check for pricing cards
        free_card = page.locator('text=Free').count()
        pro_card = page.locator('text=Pro').count()
        
        print(f"  Free tier present: {free_card > 0}")
        print(f"  Pro tier present: {pro_card > 0}")
        
        page.screenshot(path='/tmp/medx-pricing.png', full_page=True)
        print("  Screenshot: /tmp/medx-pricing.png")
        
        browser.close()
    return True

def test_onboarding_page():
    """Test 11: Onboarding page loads"""
    print("\n[TEST 11] Onboarding Page...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        page.goto(f"{BASE_URL}/onboarding")
        page.wait_for_load_state('networkidle')
        
        heading = page.locator('h1').first.text_content()
        print(f"  Heading: {heading[:50]}...")
        
        page.screenshot(path='/tmp/medx-onboarding.png', full_page=True)
        print("  Screenshot: /tmp/medx-onboarding.png")
        
        browser.close()
    return True

def test_learn_page():
    """Test 12: Learn/Lessons page loads"""
    print("\n[TEST 12] Learn Page...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        page.goto(f"{BASE_URL}/learn")
        page.wait_for_load_state('networkidle')
        
        heading = page.locator('h1').first.text_content()
        print(f"  Heading: {heading[:50]}...")
        
        page.screenshot(path='/tmp/medx-learn.png', full_page=True)
        print("  Screenshot: /tmp/medx-learn.png")
        
        browser.close()
    return True

def test_simulate_page():
    """Test 13: Simulate/Exam page loads"""
    print("\n[TEST 13] Simulate Page...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        page.goto(f"{BASE_URL}/simulate")
        page.wait_for_load_state('networkidle')
        
        heading = page.locator('h1').first.text_content()
        print(f"  Heading: {heading[:50]}...")
        
        page.screenshot(path='/tmp/medx-simulate.png', full_page=True)
        print("  Screenshot: /tmp/medx-simulate.png")
        
        browser.close()
    return True

def test_squads_page():
    """Test 14: Squads page loads"""
    print("\n[TEST 14] Squads Page...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        page.goto(f"{BASE_URL}/squads")
        page.wait_for_load_state('networkidle')
        
        heading = page.locator('h1').first.text_content()
        print(f"  Heading: {heading[:50]}...")
        
        page.screenshot(path='/tmp/medx-squads.png', full_page=True)
        print("  Screenshot: /tmp/medx-squads.png")
        
        browser.close()
    return True

def test_api_health():
    """Test 15: API endpoints respond"""
    print("\n[TEST 15] API Health Check...")
    import requests
    
    # Test that pages don't return 500 errors
    pages_to_check = [
        "/dashboard",
        "/upload", 
        "/qbank",
        "/flashcards",
        "/battle",
        "/leaderboard",
        "/tutor",
        "/learn"
    ]
    
    results = []
    for page in pages_to_check:
        try:
            # These should redirect to login or return proper pages
            response = requests.get(f"{BASE_URL}{page}", timeout=10)
            status = "OK" if response.status_code < 500 else "ERROR"
            results.append((page, response.status_code, status))
            print(f"  {page}: {response.status_code} ({status})")
        except Exception as e:
            results.append((page, 0, str(e)[:30]))
            print(f"  {page}: ERROR - {str(e)[:30]}")
    
    return all(r[2] == "OK" for r in results)

def run_all_tests():
    """Run all tests and generate report"""
    print("=" * 60)
    print("MedX AI - Comprehensive QA Test Suite")
    print("=" * 60)
    print(f"Testing: {BASE_URL}")
    print("=" * 60)
    
    tests = [
        ("Homepage", test_homepage),
        ("Login Page", test_login_page),
        ("Signup Page", test_signup_page),
        ("Upload Page", test_upload_page),
        ("QBank Page", test_qbank_page),
        ("Flashcards Page", test_flashcards_page),
        ("Battle Page", test_battle_page),
        ("Leaderboard Page", test_leaderboard_page),
        ("AI Tutor Page", test_tutor_page),
        ("Pricing Page", test_pricing_page),
        ("Onboarding Page", test_onboarding_page),
        ("Learn Page", test_learn_page),
        ("Simulate Page", test_simulate_page),
        ("Squads Page", test_squads_page),
        ("API Health", test_api_health),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, "PASS" if result else "FAIL", None))
        except Exception as e:
            results.append((name, "ERROR", str(e)))
            print(f"  ERROR: {str(e)[:100]}")
    
    print("\n" + "=" * 60)
    print("TEST RESULTS SUMMARY")
    print("=" * 60)
    
    passed = 0
    failed = 0
    errors = 0
    
    for name, status, error in results:
        emoji = "✓" if status == "PASS" else "✗" if status == "FAIL" else "⚠"
        print(f"  {emoji} {name}: {status}")
        if error:
            print(f"    Error: {error[:80]}")
        if status == "PASS":
            passed += 1
        elif status == "FAIL":
            failed += 1
        else:
            errors += 1
    
    print("=" * 60)
    print(f"TOTAL: {len(results)} tests")
    print(f"PASSED: {passed}")
    print(f"FAILED: {failed}")
    print(f"ERRORS: {errors}")
    print("=" * 60)
    
    return passed, failed, errors

if __name__ == "__main__":
    run_all_tests()
