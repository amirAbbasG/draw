import React from "react";

import ReactMarkdown from "react-markdown";

import AboutLoadingSkeleton from "@/components/features/settings/about/AboutLoadingSkeleton";
import { useIsDarkMode } from "@/hooks/useIsDarkMode";
import { cn } from "@/lib/utils";
import { app_info } from "@/constants/app-info";
import AppLogo from "@/components/shared/AppLogo";
import AppTypo from "@/components/ui/custom/app-typo";

const data = {
  title: "Nerd Studio Terms and Policy",
  about:
    "# Nerd Studio AI\r\n\r\n\r\n[Nerd Studio AI](http://www.nerdstudio.ai/)  is a cutting-edge platform dedicated to harnessing the power of AI for creativity and productivity. Continuously evolving to meet user needs, it incorporates innovative features and updates designed to streamline workflows and enhance the user experience.\r\n\r\nVisit us at: \r\n\r\n---\r\n\r\n## About Nerd Studio AI:\r\n\r\n[Nerd Studio AI](http://www.nerdstudio.ai/)  provides a comprehensive suite of AI-powered tools for various applications, making advanced AI technology accessible to everyone. With a focus on user-friendly interfaces and powerful functionality, [Nerd Studio AI](http://www.nerdstudio.ai/)  empowers individuals and businesses to achieve more with less effort.\r\n\r\n---\r\n\r\n## Key Features:\r\n\r\n### AI Writing:\r\nGenerate, refine, and improve content effortlessly. Whether you are drafting articles, emails, or social media posts, [Nerd Studio AI](http://www.nerdstudio.ai/)  ensures high-quality output tailored to your needs.\r\n\r\n### AI Translation:\r\nBreak language barriers with accurate and seamless translation capabilities. Translate text, web pages, or documents effortlessly, ensuring smooth communication across languages.\r\n\r\n### AI Chat:\r\nEngage in conversations with advanced AI models and explore innovative capabilities such as **Chat with any PDF document**, enabling users to extract insights, summarize content, or interact with information within their PDF files.\r\n\r\n### Agent Library:\r\nExplore the **Agent Library**, a collection of pre-designed AI agents tailored for specific tasks. These agents are ready to assist with unique needs, such as research, customer support, or creative projects, saving time and boosting efficiency.\r\n\r\n### Image Tools\r\n- **Image Creation:** Transform your ideas into stunning visuals with advanced AI-driven art generation tools.  \r\n- **Image Mask:** Edit images with precision by creating and modifying specific areas.  \r\n- **Image Scaling:** Resize images while maintaining quality and clarity, ideal for various creative projects.\r\n\r\n---\r\n\r\n## Accessibility and Ease of Use:\r\n\r\n[Nerd Studio AI](http://www.nerdstudio.ai/) is available across multiple platforms, including browser extensions, mobile apps, and desktop applications. Its intuitive design ensures that users of all skill levels can get started quickly and efficiently.\r\n\r\n---\r\n\r\n## Empowering Creativity and Productivity:\r\n \r\nBy combining cutting-edge AI models with innovative tools, [Nerd Studio AI](http://www.nerdstudio.ai/)  redefines the boundaries of what’s possible. Whether you are creating, translating, or automating tasks, [Nerd Studio AI](http://www.nerdstudio.ai/)  is your ultimate partner in achieving success.\r\n\r\n---\r\n\r\n## Contact Us:\r\n\r\nFeel free to reach out if you need any help or have any questions:  \r\n**Email:** Support@nerdstudio.ai",
};
const About = () => {
  const isDark = useIsDarkMode();

  // const { data, isPending } = useQuery({
  //   queryKey: QUERY_KEYS.changeLog.about,
  //   queryFn: changeLogsApi.about,
  //   refetchOnReconnect: false,
  //   refetchOnWindowFocus: false,
  //   refetchOnMount: false,
  // });

  const isPending = false;

  return (
    <div className="px-6 pb-10 my-5 bg-holder-lighter">
      {!isPending ? (
        <div className="flex flex-col sm:flex-row gap-3 items-start">
          <AppLogo width={100} height={100}/>

          <div className="flex flex-col gap-1">
            <AppTypo variant="headingXL">{app_info.appName}</AppTypo>
            <AppTypo color="secondary">
              Version {app_info.APP_VERSION}-release.202405300321
            </AppTypo>
            <AppTypo className="mt-2 mb-1 font-semibold">{data?.title}</AppTypo>
            {data?.about && (
              <div className={cn("prose max-w-none", isDark && "prose-invert")}>
                <ReactMarkdown>{data.about}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      ) : (
        <AboutLoadingSkeleton />
      )}
    </div>
  );
};

export default About;
