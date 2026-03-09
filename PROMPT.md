Build a complete, ready-to-ship Next.js app called NPI Social Marketer (npi-social-marketer) for Noble Property Inspections.

## App Purpose
Generate and post platform-specific social media content to Facebook, Instagram, and LinkedIn using Claude AI.

## Tech Stack
- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Anthropic SDK (claude-3-5-sonnet-20241022) for content generation
- Meta Graph API for Facebook + Instagram posting
- LinkedIn API for LinkedIn posting
- Vercel deployment ready

## UI/UX
Clean, single-page app with NPI brand color (#368ce2). NOT a wizard — all controls visible at once, results appear below.

### Inputs (left column or top section)
1. **Service** dropdown: Standard Home Inspection, Foundation Evaluation, Mold Inspection, Radon Testing, Sewer Scope, Pool Inspection, Commercial Inspection, Engineering Review, Pre-Listing Inspection, New Construction Inspection
2. **Market** dropdown: Houston, Dallas-Fort Worth, Austin, San Antonio, El Paso, Orlando, Tampa, Cape Coral/Fort Myers, Denver, Atlanta, Los Angeles, Mobile AL, Lake Charles LA
3. **Goal** dropdown: Brand Awareness, Promote a Service, Seasonal Tip, Engineer Differentiator, Same-Day Reports Differentiator, Hiring Inspectors, Client Testimonial Hook
4. **Tone** dropdown: Professional, Friendly & Approachable, Urgent/Promotional, Educational
5. **Generate** button

### Output (right column or below inputs)
Three platform cards shown simultaneously after generation:
- **Facebook** card: longer copy, emoji, CTA, hashtags
- **Instagram** card: punchy caption, heavy hashtags, emoji-forward
- **LinkedIn** card: professional tone, industry insight angle, minimal hashtags

Each card has:
- Platform icon/label
- Generated content (editable textarea)
- "Post Now" button (posts via API if credentials set)
- "Copy" button
- Character count

### Settings Page/Modal
API credentials (stored in localStorage, never sent to server except when posting):
- ANTHROPIC_API_KEY
- Meta Page Access Token + Facebook Page ID + Instagram Business Account ID
- LinkedIn Access Token + Organization ID

Show green/red dot indicators for which platforms are connected.

## API Routes

### POST /api/generate
Body: { service, market, goal, tone }
Uses Anthropic SDK to generate content for all 3 platforms in one call.
Return: { facebook: string, instagram: string, linkedin: string }

System prompt should emphasize:
- NPI differentiators: engineer owners (Phil & Patrick), same-day reports, crystal clear pricing, family owned, 7-day admin staff, Supra ELB eKeys
- Phone: (832) 551-1397
- Website: noble-pi.com
- Keep content authentic, not generic inspection company copy
- Each platform gets appropriately formatted content

### POST /api/post/facebook
Body: { content, pageAccessToken, pageId }
Posts to Facebook Page via Graph API v19.0

### POST /api/post/instagram
Body: { content, pageAccessToken, igAccountId }
Creates media container then publishes to Instagram Business Account

### POST /api/post/linkedin
Body: { content, accessToken, organizationId }
Posts to LinkedIn company page via v2 API

## Environment Variables (for Vercel)
ANTHROPIC_API_KEY (server-side default, can be overridden by user)

## Package.json
Name: npi-social-marketer, version 1.0.0

## Important
- Initialize as a git repo
- Include a README with setup instructions for Meta and LinkedIn API credentials
- Include .env.example
- Tailwind + shadcn-style components (no shadcn dependency — hand-craft clean components)
- Mobile responsive
- Error handling with toast-style notifications

When completely finished, run: openclaw system event --text "Done: NPI Social Marketer built and ready" --mode now
