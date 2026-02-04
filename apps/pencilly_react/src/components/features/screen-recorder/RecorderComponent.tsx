import { useState } from "react";

import RecordedItem from "@/components/features/screen-recorder/RecordedItem";
import RecordingMode from "@/components/features/screen-recorder/RecordingMode";
import RecordPreview from "@/components/features/screen-recorder/RecordPreview";
import RecordSettings from "@/components/features/screen-recorder/RecordSettings";
import { type useMediaRecorder } from "@/components/features/screen-recorder/useMediaRecorder";
import RenderIf from "@/components/shared/RenderIf";
import { Button } from "@/components/ui/button";
import AppIcon from "@/components/ui/custom/app-icon";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";
import PopupHeader from "@/components/shared/PopupHeader";

interface MediaRecorderProps {
  onClose?: () => void;
  recordAPI: ReturnType<typeof useMediaRecorder>;
}

function ScreenRecorderComponent({ onClose, recordAPI }: MediaRecorderProps) {
  const [showSettings, setShowSettings] = useState(false);
  const t = useTranslations("screen_recorder");
  const {
    clearBlobUrl,
    countdown,
    countdownEnabled,
    includeAudio,
    includeSystemAudio,
    isRecording,
    isStopped,
    mediaBlobUrl,
    recordingMode,
    recordings,
    recordingTime,
    setCountdownEnabled,
    setIncludeAudio,
    setIncludeSystemAudio,
    setRecordingMode,
    setShowCamera,
    setVideoQuality,
    showCamera,
    startRecording,
    stopRecording,
    videoQuality,
    handleDelete,
    setIsPlaying,
    previewStream,
    cameraPlusScreenPreviewStream,
    cameraPlusScreenBlobUrl,
  } =recordAPI

  return (
    <div className="w-72 sm:w-80 md:w-96 overflow-hidden max-w-full">
      {/* Header */}
        <div className="p-3.5 w-full">

      <PopupHeader
        icon={sharedIcons.video}
        title={t("title")}
        subtitle={t("subtitle")}
          rootClassName="mb-0"
        onClose={onClose}
        TopRightAction={  <AppIconButton
            icon={sharedIcons.settings}
            title={t("settings")}
            size="xs"
            onClick={() => setShowSettings(!showSettings)}
            selected={showSettings}
        />}
      />
        </div>


      <RecordSettings
        countdownEnabled={countdownEnabled}
        includeSystemAudio={includeSystemAudio}
        setCountdownEnabled={setCountdownEnabled}
        setIncludeSystemAudio={setIncludeSystemAudio}
        setVideoQuality={setVideoQuality}
        videoQuality={videoQuality}
        isOpen={showSettings}
      />

      {/* Preview Area */}
      <RecordPreview
        isRecording={isRecording}
        isStopped={isStopped}
        mediaBlobUrl={mediaBlobUrl}
        previewStream={previewStream}
        countdown={countdown}
        recordingTime={recordingTime}
        recordingMode={recordingMode}
        showCamera={showCamera}
        setIsPlaying={setIsPlaying}
        cameraPlusScreenPreviewStream={cameraPlusScreenPreviewStream}
        cameraPlusMediaUrl={cameraPlusScreenBlobUrl}
      />

      {/* Recording Mode Selection */}
      <RecordingMode
        recordingMode={recordingMode}
        setRecordingMode={setRecordingMode}
        isRecording={isRecording}
      />

      {/* Audio & Camera Controls */}
      <div className="p-3.5 border-b  col gap-3">
        <div className="spacing-row">
          <div className="row r gap-2">
            <AppIcon
              icon={includeAudio ?sharedIcons.mic : sharedIcons.mic_off}
              className={cn(
                "w-4 h-4 ",
                includeAudio ? "text-primary" : "text-foreground-light",
              )}
            />
            <AppTypo variant="small">{t("mic")}</AppTypo>
          </div>
          <Switch
            checked={includeAudio}
            onCheckedChange={setIncludeAudio}
            disabled={isRecording}
          />
        </div>

        {recordingMode === "screen+camera" && (
          <div className="flex items-center justify-between">
            <div className="row gap-2">
              <AppIcon
                icon={
                  showCamera ? sharedIcons.camera : "hugeicons:camera-off-02"
                }
                className={cn(
                  "w-4 h-4 ",
                  showCamera ? "text-primary" : "text-foreground-light",
                )}
              />
              <AppTypo variant="small">{t("show_overlay")}</AppTypo>
            </div>
            <Switch
              checked={showCamera}
              onCheckedChange={setShowCamera}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        )}
      </div>

      {/* Main Controls */}
      <div className="p-3.5 flex items-center justify-center gap-3">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          color={isRecording ? "danger" : "default"}
          icon={sharedIcons[isRecording ? "stop" : "play"]}
          disabled={!isRecording && countdown !== null}
          size="lg"
        >
          {t(isRecording ? "stop_recording" : "start_recording")}
        </Button>
      </div>

      {/* Recent Recordings */}
      {recordings.length > 0 && (
        <div className="border-t border-border">
          <div className="px-3.5 py-2 bg-muted/30">
            <AppTypo variant="small" color="secondary">
              {t("recent_recording")} ({recordings.length})
            </AppTypo>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {recordings.map((recording, index) => (
              <RecordedItem
                recording={recording}
                handleDelete={() => handleDelete(index)}
                key={index}
              />
            ))}
          </div>
        </div>
      )}

      {/* Clear Recording Button */}
      <RenderIf isTrue={!!mediaBlobUrl}>
        <div className="px-4 py-3 border-t border-border">
          <Button
            variant="outline"
            className="w-full "
            onClick={clearBlobUrl}
            icon={sharedIcons.clear}
          >
            {t("clear_recording")}
          </Button>
        </div>
      </RenderIf>
    </div>
  );
}

export default ScreenRecorderComponent;
