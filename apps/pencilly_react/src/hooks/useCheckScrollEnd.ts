import { useEffect, useRef } from "react";

export const useCheckScrollEnd = (
  fetchNextPage: () => void,
  enabled: boolean = true,
) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingTargetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!enabled) return;
    setTimeout(() => {
      const observer = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting) {
            void fetchNextPage();
          }
        },
        { threshold: 1 },
      );

      if (loadingTargetRef.current) {
        observer.observe(loadingTargetRef.current);
      }

      return () => {
        if (loadingTargetRef.current) {
          observer.unobserve(loadingTargetRef.current);
        }
      };
    }, 100);
  }, [loadingTargetRef.current, enabled]);

  return { containerRef, loadingTargetRef };
};
