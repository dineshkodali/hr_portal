// Default feature toggles for the HR Portal (used by Settings.tsx)

export interface FeatureToggle {
  key: string;
  label: string;
  description?: string;
  enabled: boolean;
}

export const defaultFeatureToggles: FeatureToggle[] = [
  {
    key: "ai_assistant",
    label: "AI HR Assistant",
    description: "Enable the AI-powered HR assistant chat and settings.",
    enabled: true,
  },
  {
    key: "advanced_reporting",
    label: "Advanced Reporting",
    description: "Enable advanced analytics and reporting modules.",
    enabled: false,
  },
  {
    key: "asset_management",
    label: "Asset Management",
    description: "Enable asset tracking and management features.",
    enabled: true,
  },
  {
    key: "custom_workflows",
    label: "Custom Workflows",
    description: "Allow admins to define custom approval workflows.",
    enabled: false,
  },
  // Add more toggles as needed
];
