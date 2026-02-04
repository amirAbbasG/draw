import { useMediaQuery } from "usehooks-ts";

import { Toaster } from "@/components/ui/sonner";

const ToastProvider = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <Toaster richColors position={isDesktop ? "bottom-right" : "top-center"} />
  );
};

export default ToastProvider;
