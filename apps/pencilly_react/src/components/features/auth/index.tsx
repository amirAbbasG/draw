import React, { useState } from "react";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import AuthButtons from "@/components/features/auth/AuthButtons";
import ForgetPass from "@/components/features/auth/forget-pass";
import OrDivider from "@/components/features/auth/OrDivider";
import Privacy from "@/components/features/auth/Privacy";
import Signin from "@/components/features/auth/signin";
import Signup from "@/components/features/auth/signup";
import AuthTabs, { type AuthPages } from "@/components/features/auth/Tabs";
import AppLogo from "@/components/shared/AppLogo";
import { Show } from "@/components/shared/Show";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { sharedIcons } from "@/constants/icons";

const pages = {
  signin: Signin,
  signup: Signup,
  forgot_pass: ForgetPass,
};

interface IProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSuccess?: () => void;
}

function AuthDialog({ isOpen, onSuccess, setIsOpen }: IProps) {
  const [currentPage, setCurrentPage] = useState<AuthPages>("signin");
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);

  const onClose = () => {
    setIsOpen(false);
    onSuccess?.();
  };

  const Main = pages[currentPage];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="p-6 sm:p-8 w-full z-100 sm:max-w-lg responsive-dialog-sm">
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>Auth</DialogTitle>
          </DialogHeader>
        </VisuallyHidden>

        <div className="centered-col h-full relative gap-6">

          <AppLogo width={80} height={80} />

          <Show>
            <Show.When
              isTrue={currentPage === "forgot_pass" || showEmailConfirmation}
            >
              <AppIconButton
                icon={sharedIcons.arrow_left}
                onClick={() => {
                  if (showEmailConfirmation) {
                    setShowEmailConfirmation(false);
                  } else {
                    setCurrentPage("signin");
                  }
                }}
                size="sm"
                className="absolute top-0 left-0 "
              />
            </Show.When>
            <Show.Else>
              <AuthTabs
                currentTab={currentPage}
                setCurrentTab={setCurrentPage}
              />
              <AuthButtons />
              <OrDivider />
            </Show.Else>
          </Show>
          <Main
            setPage={setCurrentPage}
            onClose={onClose}
            showEmailConfirmation={showEmailConfirmation}
            setShowEmailConfirmation={setShowEmailConfirmation}
          />
          <Privacy />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AuthDialog;
