"""
Schneller Security Test ohne Endlosschleife
"""
from app.security.input_validation import SecurityValidator
from app.security.xss_protection import XSSProtection

def quick_security_test():
    """Schneller Security Test"""
    
    print("🔒 Quick Security Test gestartet...")
    
    # Test 1: SQL Injection Protection
    print("✅ SQL Injection Protection Test...")
    try:
        SecurityValidator.validate_string_input("'; DROP TABLE users; --", "test_field")
        print("❌ SQL Injection wurde NICHT blockiert!")
        return False
    except Exception as e:
        print(f"✅ SQL Injection erfolgreich blockiert: {e}")
    
    # Test 2: XSS Protection
    print("✅ XSS Protection Test...")
    malicious_html = "<script>alert('XSS')</script>"
    sanitized = XSSProtection.sanitize_html(malicious_html)
    if "<script>" in sanitized:
        print("❌ XSS wurde NICHT blockiert!")
        return False
    else:
        print(f"✅ XSS erfolgreich blockiert: {sanitized}")
    
    # Test 3: E-Mail Validation
    print("✅ E-Mail Validation Test...")
    try:
        SecurityValidator.validate_email("invalid-email")
        print("❌ Ungültige E-Mail wurde NICHT blockiert!")
        return False
    except Exception as e:
        print(f"✅ Ungültige E-Mail erfolgreich blockiert: {e}")
    
    # Test 4: Password Validation
    print("✅ Password Validation Test...")
    try:
        SecurityValidator.validate_password("123456")
        print("❌ Schwaches Passwort wurde NICHT blockiert!")
        return False
    except Exception as e:
        print(f"✅ Schwaches Passwort erfolgreich blockiert: {e}")
    
    print("🎉 Alle Security-Tests erfolgreich bestanden!")
    return True

if __name__ == "__main__":
    quick_security_test()
