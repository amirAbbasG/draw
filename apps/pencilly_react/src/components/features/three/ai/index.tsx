import React, { type FC } from "react";

import { useTranslations } from "@/i18n";

// import AiExamples from "@/components/features/three/ai/Examples";
import PromptTextarea from "@/components/shared/PromptTextarea";
import {
  useGenerate3d,
  type AiTabs,
} from "@/components/features/three/ai/useGenerate3d";
import AppDrawer from "@/components/shared/AppDrawer";
import DynamicButton from "@/components/shared/DynamicButton";
import FileList from "@/components/shared/FileList";
import { Show } from "@/components/shared/Show";
import UploadZone from "@/components/shared/UploadZone";
import { Button } from "@/components/ui/button";
import AppTabs from "@/components/ui/custom/app-tabs";
import AppTypo from "@/components/ui/custom/app-typo";
import { sharedIcons } from "@/constants/icons";
import {CreditConfirmationPopover} from "@/components/layout/CreditConfirm";

const icons = {
  text_to_3d: sharedIcons.text_ai,
  image_to_3d: sharedIcons.image_ai,
};

const tabs: AiTabs[] = ["text_to_3d", "image_to_3d"];

interface IProps {}

const TextTo3D: FC<IProps> = () => {
  const t = useTranslations("three.ai");
  const { form, onChange, generate, isProcessing, activeTab, setActiveTab } =
    useGenerate3d();

  return (
    <AppDrawer
      title={t("title")}
      Trigger={
        <DynamicButton
          variant="default"
          icon={sharedIcons.wand}
          title={t("title")}
          element="div"
        />
      }
      containerId="app-layout-main"
      needsAuth
      contentClassName="top-14"
      side="left"
      modal={false}
    >
      <div className="col gap-4 p-4">
        <AppTabs
          tabs={tabs.map(tab => ({
            title: t(tab),
            tabKey: tab,
            icon: icons[tab],
          }))}
          activeTab={activeTab}
          onTabChange={val => setActiveTab(val as AiTabs)}
          itemClassName=" max-w-none"
          className="w-full"
        />
        <Show>
          <Show.When isTrue={activeTab === "text_to_3d"}>
            <PromptTextarea
              value={form.prompt}
              setValue={prompt => onChange({ prompt })}
              description={t("prompt_description")}
              placeholder={t("prompt_placeholder")}
              // Footer={<AiExamples setPrompt={prompt => onChange({ prompt })} />}
            />
          </Show.When>
          <Show.Else>
            <div className="col gap-label-space">
              <AppTypo type="label">{t("image")}</AppTypo>
              <UploadZone
                files={form.image ? [form.image] : []}
                onUpload={files => onChange({ image: files[0] })}
              />
              <FileList
                files={form.image ? [form.image] : []}
                onRemove={() => onChange({ image: undefined })}
              />
            </div>
          </Show.Else>
        </Show>
        {/*<Count*/}
        {/*  value={form.count}*/}
        {/*  onChangeValue={count => onChange({ count })}*/}
        {/*  options={[1, 2, 3, 4, 6, 8]}*/}
        {/*/>*/}

        <CreditConfirmationPopover
            onConfirm={generate}
            featureName={t("title")}
            storageKey="AI3D"
        >
        <Button
          disabled={
            (activeTab === "text_to_3d" && !form.prompt.trim().length) ||
            (activeTab === "image_to_3d" && !form.image) ||
            isProcessing
          }
          icon={sharedIcons.generate}
          isPending={isProcessing}
          className="mt-4"
        >
          {t("generate")}
        </Button>
        </CreditConfirmationPopover>
      </div>
    </AppDrawer>
  );
};

export default TextTo3D;
