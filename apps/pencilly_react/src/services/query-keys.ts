export const queryKeys = {
  uploadedImages: ["uploaded_images"],
  getMe: ["get_me"],
  userBalance: ["user_balance"],
  tokens: ["tokens"],
  history: ["history"],
  getReferral: ["get_referral"],
  getPlans: (type: string = "all") => ["plans", { type }],
  userTransactions: ["transactions"],
  userCredits: ["credits"],
  versionHistory: (historyId: string) => ["version_history", { historyId }],
};
