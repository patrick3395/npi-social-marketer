export const SERVICES = [
  "Standard Home Inspection",
  "Foundation Evaluation",
  "Mold Inspection",
  "Radon Testing",
  "Sewer Scope",
  "Pool Inspection",
  "Commercial Inspection",
  "Engineering Review",
  "Pre-Listing Inspection",
  "New Construction Inspection",
] as const;

export const MARKETS = [
  "Houston",
  "Dallas-Fort Worth",
  "Austin",
  "San Antonio",
  "El Paso",
  "Orlando",
  "Tampa",
  "Cape Coral/Fort Myers",
  "Denver",
  "Atlanta",
  "Los Angeles",
  "Mobile AL",
  "Lake Charles LA",
] as const;

export const GOALS = [
  "Brand Awareness",
  "Promote a Service",
  "Seasonal Tip",
  "Engineer Differentiator",
  "Same-Day Reports Differentiator",
  "Hiring Inspectors",
  "Client Testimonial Hook",
] as const;

export const TONES = [
  "Professional",
  "Friendly & Approachable",
  "Urgent/Promotional",
  "Educational",
] as const;

export type Service = (typeof SERVICES)[number];
export type Market = (typeof MARKETS)[number];
export type Goal = (typeof GOALS)[number];
export type Tone = (typeof TONES)[number];

export interface GenerateRequest {
  service: Service;
  market: Market;
  goal: Goal;
  tone: Tone;
}

export interface GenerateResponse {
  facebook: string;
  instagram: string;
  linkedin: string;
}

export interface Credentials {
  anthropicApiKey: string;
  falApiKey: string;
  metaPageAccessToken: string;
  facebookPageId: string;
  instagramAccountId: string;
  linkedinAccessToken: string;
  linkedinOrganizationId: string;
}

export const DEFAULT_CREDENTIALS: Credentials = {
  anthropicApiKey: "",
  falApiKey: "",
  metaPageAccessToken: "",
  facebookPageId: "",
  instagramAccountId: "",
  linkedinAccessToken: "",
  linkedinOrganizationId: "",
};

export type Platform = "facebook" | "instagram" | "linkedin";

export const PLATFORM_CONFIG = {
  facebook: {
    label: "Facebook",
    color: "#1877F2",
    maxChars: 63206,
  },
  instagram: {
    label: "Instagram",
    color: "#E4405F",
    maxChars: 2200,
  },
  linkedin: {
    label: "LinkedIn",
    color: "#0A66C2",
    maxChars: 3000,
  },
} as const;
