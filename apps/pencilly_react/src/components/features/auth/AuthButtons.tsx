import { useSubmitOAuth } from "@/components/features/auth/useSubmitOAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n";

const providers = [
  {
    id: "google",
    icon: "logos:google-icon",
  },
  {
    id: "apple",
    icon: "material-icon-theme:applescript",
  },
] as const;

const AuthButtons = () => {
  const { startOauth, isPending, pendingProvider } = useSubmitOAuth();
  const t = useTranslations("auth.oauth");

  return (
    <div className="col gap-4 w-full">
      {providers.map(provider => (
        <Button
          variant="outline"
          type="button"
          className={cn("w-full row gap-2")}
          key={provider.id}
          icon={provider.icon}
          onClick={() => startOauth({ provider: provider.id })}
          disabled={isPending}
          isPending={pendingProvider === provider.id && isPending}
        >
          {t(provider.id)}
        </Button>
      ))}
    </div>
  );
};

export default AuthButtons;
