import React, { useState } from "react";



import AppLayout from "@/components/layout/AppLayout";
import { Show } from "@/components/shared/Show";
import { useParamsTab } from "@/hooks/useParamsTab";





const Home = () => {
    const [drawAPI, setDrawAPI] = useState<DrawAPI>(null);
    const { activeParamTab } = useParamsTab({ defaultValue: "2d_canvas" });
    const activeTab = activeParamTab || "2d_canvas";

    return (
      <AppLayout>
        <AppLayout.Header drawAPI={drawAPI} activeTab={activeTab} />
        <AppLayout.Main>
          <Show>
            <Show.When isTrue={activeTab === "2d_canvas"}>
              <AppLayout.Draw drawAPI={drawAPI} setDrawAPI={setDrawAPI} />
            </Show.When>
            <Show.Else>
              <AppLayout.ThreeCanvas />
            </Show.Else>
          </Show>
        </AppLayout.Main>
      </AppLayout>
    );
};

export default Home;