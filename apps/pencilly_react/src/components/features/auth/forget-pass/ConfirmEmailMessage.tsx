import { Button } from "@/components/ui/button";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n";

interface IProps {
  email: string;
  resendEmail: () => void;
  rootClassName?: string;
  isForgotPas?: boolean;
}

/**
 * Component to display a confirmation message for email actions.
 *
 * @param {Object} props - The properties for the component.
 * @param {string} props.email - The email address to display.
 * @param {function} props.resendEmail - Function to handle resending the email.
 * @param {string} [props.rootClassName] - Additional class names for the root element.
 * @param {boolean} [props.isForgotPas=false] - Flag to indicate if the message is for a forgotten password.
 */
function ConfirmEmailMessage({
  email,
  resendEmail,
  rootClassName,
  isForgotPas = false,
}: IProps) {
  const t = useTranslations("auth.confirm_email");

  return (
    <div className={cn("centered-col z-50 flex h-fit w-full ", rootClassName)}>
      <div className="col relative h-fit w-full text-center gap-6">
        <AppTypo variant="headingL">{t("title")}</AppTypo>
        <AppTypo className=" text-label-light">
          {t("description_part1")} <span className="text-primary">{email}</span>{" "}
          {t("description_part2")}{" "}
          {isForgotPas
            ? t("forgot_complete_message")
            : t("signup_complete_message")}
        </AppTypo>

        <div className="centered-row  gap-2 border-t p-2">
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          <p className="font-normal text-label-light">{t("link_message")}</p>
          <Button
            variant="link"
            className="fit p-0"
            onClick={() => resendEmail()}
          >
            {t("send_button_label")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmEmailMessage;
