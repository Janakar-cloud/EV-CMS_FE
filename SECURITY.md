# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow these steps:

### 1. DO NOT Create a Public Issue

Please do not create a public GitHub issue for security vulnerabilities.

### 2. Report Privately

Send details to: security@janakar.cloud

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### 3. Response Time

- Initial response: Within 48 hours
- Status update: Within 7 days
- Fix timeline: Varies by severity

### 4. Severity Levels

**Critical**: Immediate attention, patch within 24-48 hours
- Remote code execution
- Authentication bypass
- Data breach potential

**High**: Patch within 1 week
- Privilege escalation
- SQL injection
- XSS vulnerabilities

**Medium**: Patch within 2-4 weeks
- CSRF vulnerabilities
- Information disclosure
- Denial of service

**Low**: Patch in next release
- Minor information leaks
- Non-critical misconfigurations

### 5. Disclosure Policy

- We will acknowledge receipt within 48 hours
- We will provide updates on progress
- We will credit reporters (unless anonymity requested)
- Public disclosure after fix is deployed

### 6. Security Best Practices

**For Users:**
- Keep dependencies updated
- Use strong, unique passwords
- Enable 2FA when available
- Review access logs regularly
- Use HTTPS in production
- Implement proper CORS policies

**For Contributors:**
- Never commit secrets or credentials
- Use environment variables for configuration
- Validate and sanitize all inputs
- Implement proper authentication/authorization
- Follow OWASP security guidelines
- Run security audits before releases

### 7. Known Security Measures

- JWT authentication
- Route protection middleware
- Security headers (CSP, X-Frame-Options, etc.)
- Input validation and sanitization
- HTTPS enforcement in production
- Regular dependency updates
- Automated security scanning (GitHub Dependabot)

### 8. Security Updates

Security updates will be released as:
- Patch versions for minor fixes
- Minor versions for moderate fixes
- Notes in CHANGELOG.md
- GitHub Security Advisories

## Thank You

We appreciate your help in keeping EV-CMS secure!
