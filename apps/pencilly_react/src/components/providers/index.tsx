import React from "react";

import { useShallow } from "zustand/react/shallow";

import AuthDialog from "@/components/features/auth";
import IncomingCallPopup from "@/components/features/call/IncomingCallPopup";
// import CookieConsentApp from "@/components/providers/ConsentCookies/CookiesConsent";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import ToastProvider from "@/components/providers/ToastProvider";
import { ThemeProvider } from "@/stores/context/theme";
import { UserProvider } from "@/stores/context/user";
import {setIsAuthPopupOpen, setIsUpgradePopupOpen} from "@/stores/zustand/ui/actions";
import { useUiStore } from "@/stores/zustand/ui/ui-store";
import {UpgradeDialog} from "@/components/layout/UpgradeDialog";

export default function Providers({ children }: { children: React.ReactNode }) {
    const [isAuthPopupOpen, isUpgradePopupOpen] = useUiStore(
        useShallow(state => [state.isAuthPopupOpen, state.isUpgradePopupOpen]),
    );

    return (
        <ThemeProvider>
            {/* thi is for query client */}
            <ReactQueryProvider>
                {/*<CookieConsentApp />*/}
                <UserProvider>
                    {children}
                    <AuthDialog isOpen={isAuthPopupOpen} setIsOpen={setIsAuthPopupOpen} />
                    <UpgradeDialog isOpen={isUpgradePopupOpen} setIsOpen={setIsUpgradePopupOpen} />
                    <IncomingCallPopup />
                </UserProvider>
            </ReactQueryProvider>
            {/* thi is for toast */}
            <ToastProvider />
        </ThemeProvider>
    );
}
