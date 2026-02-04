import React from "react";

import AppIcon from "@/components/ui/custom/app-icon";
import AppTypo from "@/components/ui/custom/app-typo";

export const fileIcons = {
  file: "hugeicons:file-empty-02",
  png: "hugeicons:png-02",
  html: "hugeicons:html-file-02",
  pdf: "hugeicons:pdf-02",
  doc: "hugeicons:doc-02",
  js: "hugeicons:java-script",
  jsx: "hugeicons:jsx-03",
  css: "hugeicons:css-file-02",
  csv: "hugeicons:csv-02",
  docx: "hugeicons:doc-02",
  php: "hugeicons:php",
  ppt: "hugeicons:ppt-02",
  rs: "ph:file-rs",
  sql: "hugeicons:sql",
  ts: "hugeicons:typescript-03",
  tsx: "hugeicons:typescript-03",
  txt: "hugeicons:txt-02",
  vue: "ph:file-vue",
  xml: "hugeicons:xml-02",
  zip: "hugeicons:zip-02",
  xsl: "hugeicons:xsl-02",
  xls: "hugeicons:xls-02",
  wav: "hugeicons:wav-02",
  mp3: "hugeicons:mp3-01",
  mp4: "hugeicons:mp-4-02",
};

const FileIcon = ({ file }: { file: File }) => {
  if (!file) return null;
  const fileSizeInKB = Math.round(file.size / 1024);

  if (file.type.includes("image")) {
    const imageUrl = URL.createObjectURL(file);

    return (
      <div
        style={{
          backgroundImage: `url(${imageUrl || file ? URL.createObjectURL(file) : ""})`,
          backgroundPosition: "center",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
        }}
        className="w-14 h-14 rounded bg-holder-light border"
      />
    );
  }

  const splitName = file.name.split(".");
  const mimeType = splitName[splitName.length - 1];

  const icon = fileIcons[mimeType as keyof typeof fileIcons] || "tabler:file";
  return (
    <div className="w-[9.625rem] h-12 gap-2 p-1 bg-holder-lighter border rounded flex flex-row items-center">
      <div className="h-9 w-9 min-w-9 bg-danger-lighter text-danger rounded flex flex-col items-center justify-center">
        <AppIcon fontSize={20} icon={icon} />
      </div>
      <div className="flex-1 flex flex-col max-w-full w-[calc(100%-3.25rem)] gap-0.5">
        <AppTypo className="truncate -mt-0.5" variant="small" type="label">
          {file.name}
        </AppTypo>
        <AppTypo variant="small" color="secondary" type="label">
          {fileSizeInKB}kb
        </AppTypo>
      </div>
    </div>
  );
};

// Component to render the list of files with preview and remove button
const FileList: React.FC<{
  files: File[];
  onRemove?: (index: number) => void;
}> = ({ files, onRemove }) => {
  if (!files.length) return null;

  return (
    <div className="w-full row py-2.5 gap-2 ">
      {files.map((file, index) => (
        <div key={index} className="flex row rounded ">
          <div title={file.name} className="relative group">
            <FileIcon file={file} />
            {onRemove && (
              <div className="absolute flex justify-center items-center h-4 w-4 -top-1.5 -end-1.5 cursor-pointer text-holder-lighter bg-label-dark rounded-full">
                <AppIcon
                  fontSize={10}
                  onClick={() => onRemove(index)}
                  icon="ep:close-bold"
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileList;
