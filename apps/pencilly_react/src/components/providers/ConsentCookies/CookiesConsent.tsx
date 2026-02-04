import { useEffect } from "react";

import "vanilla-cookieconsent/dist/cookieconsent.css";

import { run } from "vanilla-cookieconsent";

import "./ccStyle.css";

import { useTheme } from "@/stores/context/theme";

import { en } from "./translation/en";
import { updateConsent } from "./updteConsent";

export default function CookieConsentApp() {
  const { theme } = useTheme();
  useEffect(() => {
    void run({
      categories: {
        necessary: { enabled: true, readOnly: true },
        analytics: {
          autoClear: {
            cookies: [{ name: /^_ga/ }, { name: "_gid" }],
          },
          services: {
            analytics_storage: {
              label: "Enables storage related to analytics.",
            },
          },
        },
        advertisement: {
          services: {
            ad_storage: { label: "Advertising storage." },
            ad_user_data: { label: "Google ad user data." },
            ad_personalization: { label: "Personalized advertising." },
          },
        },
        functionality: {
          services: {
            functionality_storage: {
              label: "Functional settings like language.",
            },
            personalization_storage: {
              label: "Personalized features like video recommendations.",
            },
          },
        },
        security: {
          services: {
            security_storage: {
              label: "Security, fraud prevention, user protection.",
            },
          },
        },
      },
      language: {
        default: "en",
        translations: {
          en: en,
        },
      },
      guiOptions: {
        consentModal: {
          layout: "bar",
          position: "bottom center",
        },
      },

      onFirstConsent: updateConsent,
      onConsent: updateConsent,
      onChange: updateConsent,
    });
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("cc--darkmode", theme === "dark");
  }, [theme]);

  return null;
}
