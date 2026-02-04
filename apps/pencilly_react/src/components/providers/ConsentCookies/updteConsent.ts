// typescript
import { acceptedService } from "vanilla-cookieconsent";

export const updateConsent = async (): Promise<void> => {
  try {
    const consentData = {
      analytics_storage: acceptedService("analytics_storage", "analytics")
        ? "granted"
        : "denied",
      ad_storage: acceptedService("ad_storage", "advertisement")
        ? "granted"
        : "denied",
      ad_user_data: acceptedService("ad_user_data", "advertisement")
        ? "granted"
        : "denied",
      ad_personalization: acceptedService("ad_personalization", "advertisement")
        ? "granted"
        : "denied",
      functionality_storage: acceptedService(
        "functionality_storage",
        "functionality",
      )
        ? "granted"
        : "denied",
      personalization_storage: acceptedService(
        "personalization_storage",
        "functionality",
      )
        ? "granted"
        : "denied",
      security_storage: acceptedService("security_storage", "security")
        ? "granted"
        : "denied",
    };

    const userData = {
      date_of_registration: new Date(),
      userAgent: window.navigator.userAgent,
    };

    if (typeof window.gtag === "function") {
      try {
        window.gtag("consent", "update", consentData);
      } catch (err) {
        // swallow extensions/gtag runtime errors to avoid unhandled promise rejections
        console.warn("gtag call failed:", err);
      }
    } else {
      // gtag not available — optional debug
      console.debug("gtag not available, skipping analytics consent update");
    }

    localStorage.setItem(
      "user_consent",
      JSON.stringify({ ...consentData, ...userData }),
    );
  } catch (err) {
    console.warn("updateConsent failed:", err);
  }
};

declare global {
  interface Window {
    gtag: (
      command: string,
      action: string,
      params: Record<string, any>,
    ) => void;
  }
}
