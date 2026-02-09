import FileSaver from "file-saver";

export const isScreenCaptureSupported = (): boolean => {
    if (typeof navigator === "undefined") return false;
    return !!navigator.mediaDevices?.getDisplayMedia;
};

export const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export const handleDownload = (url: string, name: string) => {
    FileSaver.saveAs(url, `${name}.webm`)
}


export  type VideoQuality = "720p" | "1080p" | "1440p";

export const getVideoConstraints = (
    videoQuality: VideoQuality = "1080p"
) => {
    const qualities = {
        "720p": { width: 1280, height: 720 },
        "1080p": { width: 1920, height: 1080 },
        "1440p": { width: 2560, height: 1440 },
    }
    return qualities[videoQuality]
}
