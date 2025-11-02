/**
 * Feature flags for CLDB-AI production release control
 * 
 * This configuration controls which features are enabled in the frontend.
 * Used to safely disable complex features during production rollout.
 */

// Feature flag definitions
export const FEATURE_FLAGS = {
  // ROI Calculator features
  SIMPLE_ROI: true,              // Always enabled - production ready
  CAMPAIGN_MATCHED_ROI: false,   // Disabled for production - coming soon
  
  // Future features can be added here
  // PERFORMANCE_REVIEW: false,
  // IMPROVEMENTS_AGENT: false,
} as const;

// Type for feature flag keys
export type FeatureFlag = keyof typeof FEATURE_FLAGS;

/**
 * Check if a feature is enabled
 * @param feature - The feature flag to check
 * @returns boolean indicating if the feature is enabled
 */
export const isFeatureEnabled = (feature: FeatureFlag): boolean => {
  return FEATURE_FLAGS[feature];
};

/**
 * Get all enabled features
 * @returns Array of enabled feature names
 */
export const getEnabledFeatures = (): FeatureFlag[] => {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, enabled]) => enabled)
    .map(([feature, _]) => feature as FeatureFlag);
};

/**
 * Get all disabled features
 * @returns Array of disabled feature names
 */
export const getDisabledFeatures = (): FeatureFlag[] => {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, enabled]) => !enabled)
    .map(([feature, _]) => feature as FeatureFlag);
};

// Export for debugging in development
if (process.env.NODE_ENV === 'development') {
  console.log('🚀 CLDB-AI Feature Flags:', {
    enabled: getEnabledFeatures(),
    disabled: getDisabledFeatures(),
  });
}