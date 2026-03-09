# NPI Social Marketer

Generate and post platform-specific social media content for Noble Property Inspections using Claude AI.

## Quick Start

```bash
npm install
cp .env.example .env    # Add your Anthropic API key
npm run dev              # http://localhost:3000
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Default Anthropic API key for content generation |

Users can also set their own API key and social media credentials in the Settings modal (stored in browser localStorage).

## Social Media API Setup

### Facebook Page Posting

1. Go to [Meta for Developers](https://developers.facebook.com/) and create an app
2. Add the **Pages API** product
3. Generate a **Page Access Token** with `pages_manage_posts` permission
4. Find your **Page ID** on your Facebook Page > About > Page ID
5. Enter both in the app's Settings modal

### Instagram Business Posting

1. Your Instagram account must be a **Business** or **Creator** account
2. It must be connected to a Facebook Page
3. Use the same Meta app and Page Access Token from above (needs `instagram_basic` and `instagram_content_publish` permissions)
4. Find your **Instagram Business Account ID** via the Graph API: `GET /{page-id}?fields=instagram_business_account`
5. Enter the IG Account ID in Settings

> Note: Instagram API requires an image or video for feed posts. Text-only posting has limitations.

### LinkedIn Company Page Posting

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/) and create an app
2. Request the **Community Management API** product
3. Your app needs the `w_organization_social` scope
4. Generate an **Access Token** via OAuth 2.0 flow
5. Find your **Organization ID** from your LinkedIn company page URL (`/company/{id}/`)
6. Enter both in Settings

## Tech Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Anthropic SDK (Claude 3.5 Sonnet) for content generation
- Meta Graph API v19.0 for Facebook + Instagram
- LinkedIn v2 UGC API for LinkedIn

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/noble-property-inspections/npi-social-marketer)

1. Set `ANTHROPIC_API_KEY` in Vercel environment variables
2. Social media credentials are entered per-user in the browser Settings modal
