# Pre-Deployment Checklist

Complete checklist before deploying to production.

## 🔐 Security

- [ ] All environment variables configured in production
- [ ] API keys stored in secure environment (not in code)
- [ ] JWT secret is strong and unique (min 32 characters)
- [ ] HTTPS enabled for production
- [ ] Security headers configured (check middleware.ts)
- [ ] CORS properly configured on backend
- [ ] Rate limiting enabled on API
- [ ] SQL injection protection in place
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented where needed
- [ ] Authentication tokens expire appropriately
- [ ] Passwords hashed with bcrypt (backend)
- [ ] File upload validation (if applicable)
- [ ] No sensitive data in console.log statements

## 🌐 Environment Configuration

- [ ] `.env.production` file created
- [ ] `NEXT_PUBLIC_API_URL` points to production API
- [ ] `NEXT_PUBLIC_OCPP_API_URL` configured
- [ ] `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is valid
- [ ] All required environment variables documented
- [ ] `.env` files added to `.gitignore`
- [ ] Vercel/hosting platform environment variables set

## 🧪 Testing

- [ ] All tests passing (`npm test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code formatted (`npm run format:check`)
- [ ] Critical user flows tested manually
- [ ] Authentication flow tested
- [ ] Payment flow tested (if applicable)
- [ ] Mobile responsiveness checked
- [ ] Cross-browser testing completed
- [ ] Test coverage acceptable (aim for >70%)

## 🏗️ Build & Performance

- [ ] Production build succeeds (`npm run build`)
- [ ] No build warnings
- [ ] Bundle size optimized
- [ ] Images optimized and using Next.js Image
- [ ] Lazy loading implemented for heavy components
- [ ] Code splitting configured
- [ ] Unused dependencies removed
- [ ] Tree shaking verified
- [ ] Lighthouse score > 90 (Performance, Accessibility, Best Practices, SEO)

## 📊 Monitoring & Analytics

- [ ] Error tracking configured (Sentry, LogRocket, etc.)
- [ ] Analytics configured (Google Analytics, Vercel Analytics)
- [ ] Performance monitoring set up
- [ ] Logging configured
- [ ] Health check endpoint available
- [ ] Uptime monitoring configured

## 🗄️ Database & Backend

- [ ] Database migrations completed
- [ ] Database backups configured
- [ ] Database connection pooling configured
- [ ] Database indexes optimized
- [ ] API rate limiting configured
- [ ] Redis/caching configured (if applicable)
- [ ] WebSocket connections stable
- [ ] OCPP server configured and tested

## 📱 Frontend

- [ ] Meta tags configured (SEO)
- [ ] Favicon and app icons present
- [ ] Manifest.json configured
- [ ] robots.txt configured
- [ ] Sitemap generated (if applicable)
- [ ] 404 page customized
- [ ] 500 error page customized
- [ ] Loading states implemented
- [ ] Error boundaries in place
- [ ] Offline support (if applicable)

## 🚀 Deployment

- [ ] Deployment platform chosen (Vercel, AWS, etc.)
- [ ] Domain name configured
- [ ] SSL certificate installed
- [ ] CDN configured
- [ ] DNS records updated
- [ ] Redirects configured (www to non-www, http to https)
- [ ] Build cache configured
- [ ] Environment variables set in hosting platform
- [ ] Deployment preview tested
- [ ] Rollback plan in place

## 📝 Documentation

- [ ] README updated with deployment instructions
- [ ] API documentation complete
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Troubleshooting guide created
- [ ] Team onboarding docs created
- [ ] User documentation/help section complete

## 🔄 CI/CD

- [ ] GitHub Actions workflow tested
- [ ] All CI checks passing
- [ ] Automated tests running on PR
- [ ] Automated deployment configured
- [ ] Deployment notifications configured
- [ ] Version tagging strategy in place

## 🎯 Features

- [ ] Authentication working (login, logout, password reset)
- [ ] User management functional
- [ ] Charger management working
- [ ] Session tracking operational
- [ ] Payment processing tested
- [ ] Pricing rules configured
- [ ] Real-time monitoring working
- [ ] Notifications functioning
- [ ] Analytics displaying correctly
- [ ] Reports generating properly

## 📧 Communication

- [ ] Email service configured (SMTP)
- [ ] Email templates created
- [ ] Transactional emails tested
- [ ] SMS service configured (if applicable)
- [ ] Push notifications configured (if applicable)
- [ ] Support ticket system working

## 🔍 SEO & Accessibility

- [ ] Title tags optimized
- [ ] Meta descriptions added
- [ ] Open Graph tags configured
- [ ] Twitter Card tags configured
- [ ] Structured data added (JSON-LD)
- [ ] Alt text for all images
- [ ] ARIA labels where needed
- [ ] Keyboard navigation working
- [ ] Screen reader tested
- [ ] Color contrast WCAG AA compliant

## 💰 Payment & Billing

- [ ] Payment gateway configured
- [ ] Test transactions completed
- [ ] Refund process tested
- [ ] Invoice generation working
- [ ] Payment webhooks configured
- [ ] Failed payment handling implemented

## 📊 Admin Features

- [ ] Admin dashboard accessible
- [ ] User roles and permissions working
- [ ] Audit logs implemented
- [ ] Data export functionality working
- [ ] Bulk operations tested
- [ ] System settings configurable

## 🔔 Final Checks

- [ ] All hardcoded values replaced with constants
- [ ] All TODO comments addressed
- [ ] Console.log statements removed (production)
- [ ] Debug code removed
- [ ] Commented-out code removed
- [ ] Unused files deleted
- [ ] Git history clean (no sensitive data)
- [ ] .gitignore properly configured
- [ ] License file present
- [ ] Third-party licenses compliant

## 🎉 Go-Live

- [ ] Stakeholders notified
- [ ] Support team briefed
- [ ] Monitoring dashboards open
- [ ] Incident response plan ready
- [ ] Communication plan in place
- [ ] Rollback procedure documented
- [ ] Post-deployment testing scheduled
- [ ] User announcement prepared

---

## Deployment Command

Once all checks are complete:

```bash
# Final checks
npm run lint
npm run type-check
npm test
npm run build

# Deploy
vercel --prod
# OR
npm run deploy
```

---

## Post-Deployment

Within 24 hours of deployment:

- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify all integrations working
- [ ] Test critical user flows in production
- [ ] Review analytics setup
- [ ] Check email delivery
- [ ] Monitor server logs
- [ ] Verify backups running
- [ ] Test rollback procedure

---

## Emergency Contacts

| Role | Name | Contact |
|------|------|---------|
| Tech Lead | ___ | ___ |
| DevOps | ___ | ___ |
| Product Owner | ___ | ___ |
| Support Lead | ___ | ___ |

---

## Useful Commands

```bash
# Check production build
npm run build
npm start

# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Check bundle size
npm run build && du -sh .next

# Test production locally
npm run build && npm start
```

---

**Last Updated:** November 18, 2025
**Next Review:** Before each deployment
