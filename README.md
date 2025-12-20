# Intellisage AI - AI-Powered SaaS Platform
### DEMO_LINK: https://drive.google.com/file/d/17FLbQhhDU9vNkeJWWT6s3NfNI2dvDJSj/view?usp=sharing

An AI-powered SaaS application with subscription management, usage-based billing, and document processing. 
Features Stripe integration for payment handling and OpenAI API for chat and PDF summarization.


## Features

###  Subscription Management
- Three-tier pricing (Free/Pro/Premium) with Stripe integration
- Token-based usage tracking with monthly resets on billing cycle
- Cancel-at-period-end workflow (users keep access until billing ends)
- Webhook-driven subscription lifecycle (no manual state management)
- Idempotent event processing to prevent duplicate charges

###  AI Capabilities
- **Chat**: Multi-turn conversations with OpenAI GPT-4
- **PDF Summarization**: Upload and summarize documents (50+ pages supported)
- **OCR Processing**: Extract text from scanned documents (Pro/Premium only)
- **History**: Save and retrieve past interactions (paid tiers only)

###  User Dashboard
- Real-time token quota tracking
- Subscription status and billing information
- Usage analytics and history
- Self-service subscription management

---

## Tech Stack

**Frontend:** React, TypeScript, Tailwind CSS  
**Backend:** Node.js, Express.js  
**Database:** MongoDB  
**Payment:** Stripe (webhooks + API)  
**AI:** OpenAI API  
**Auth:** JWT with HTTP-only cookies  

---

## Architecture
```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   React     │────────▶│  Express.js  │────────▶│  MongoDB    │
│  Frontend   │   JWT   │   REST API   │         │  Database   │
└─────────────┘         └──────────────┘         └─────────────┘
                              │    │
                              │    └──────────────▶┌─────────────┐
                              │                    │  OpenAI API │
                              │                    └─────────────┘
                              ▼
                        ┌──────────────┐
                        │  Stripe API  │
                        │  (Webhooks)  │
                        └──────────────┘
```

---
### Middleware Architecture
```
Request → Authentication → Authorization → Usage Validation → API Handler
           (JWT verify)    (Plan check)     (Token check)     (Execute)

## Key Technical Challenges Solved

### 1. Preventing Subscription Abuse
**Problem:** Users could cancel and resubscribe to reset token limits.

**Solution:** Token resets are triggered only by successful Stripe payments (`invoice.payment_succeeded`), 
not by subscription creation/cancellation. This prevents free token refreshes through subscription cycling.

### 2. Webhook Idempotency
**Problem:** Stripe retries webhooks, potentially causing duplicate charges or token grants.

**Solution:** Store webhook event IDs in database. Check for existence before processing. 

### 3. Tiered Feature Access
**Problem:** Need to restrict OCR and history features to paid users.

**Solution:** Middleware checks user's subscription tier against required tier for each endpoint. 
Database-level constraints prevent unauthorized access even if frontend is bypassed.

---

### Prerequisites
- Node.js 18+
- MongoDB instance
- Stripe account
- OpenAI API key


## Security Features

- **JWT Authentication** - Token-based auth with HTTP-only cookies
- **Stripe Signature Verification** - Validates webhook authenticity
- **Rate Limiting** - Prevents API abuse
- **Input Validation** - All user inputs sanitized
- **Database-Level Permissions** - Enforces tier-based access control

---


## Future Improvements

- [ ] Add support for more document formats (Word, Excel)
- [ ] Implement collaborative document annotations
- [ ] Add team/organization subscriptions
- [ ] Build admin dashboard for usage monitoring
- [ ] Add email notifications for quota warnings

---

## What I Learned

- Handling complex Stripe webhook events and preventing race conditions
- Building abuse-resistant subscription systems
- Integrating AI APIs with token management
- Database schema design for multi-tenant SaaS applications
- Frontend state management for real-time quota updates

---

- 
