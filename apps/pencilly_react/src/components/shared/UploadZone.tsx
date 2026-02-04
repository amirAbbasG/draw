import React, { useCallback, type FC } from "react";

import { useDropzone } from "react-dropzone";

import AppIcon from "@/components/ui/custom/app-icon";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n";

interface IProps extends React.ComponentPropsWithoutRef<"div"> {
  files: File[];
  acceptedFiles?: Record<string, string[]>;
  maxFileSize?: number;
  multiple?: boolean;
  disabled?: boolean;
  maxFiles?: number;
  onUpload?: (files: File[]) => void;
}

/**
 * UploadZone Component
 *
 * A reusable drag-and-drop file upload component with support for file validation, size limits, and custom styling.
 *
 * @component
 * @param  props - The props for the UploadZone component.
 * @param {File[]} props.files - The list of files currently uploaded.
 * @param {string} [props.className] - Additional CSS classes for styling the upload zone container.
 * @param {Record<string, string[]>} [props.acceptedFiles] - A record of accepted file types and their extensions.
 * Defaults to accepting JPEG and PNG images.
 * @param {number} [props.maxFileSize=5] - The maximum file size allowed for uploads, in megabytes.
 * @param {boolean} [props.multiple=false] - Whether multiple files can be uploaded at once.
 * @param {boolean} [props.disabled=false] - Whether the upload zone is disabled.
 * @param {function} [props.onUpload] - Callback function triggered when files are successfully uploaded.
 * @param {number} [props.maxFiles] - The maximum number of files allowed for upload.
 * @param {React.ReactNode} [props.children] - Additional child elements to render inside the upload zone.
 * @param {Object} [props.divProps] - Additional props for the root `div` element.
 *
 * @returns JSX.Element The rendered UploadZone component.
 */
const UploadZone: FC<IProps> = ({
  files,
  className,
  acceptedFiles = {
    // "application/pdf": [],
    "image/jpeg": [],
    "image/png": [],
  },
  children,
  maxFileSize = 5,
  multiple = false,
  disabled = false,
  onUpload,
  maxFiles,
  ...divProps
}) => {
  const t = useTranslations("shared");

  const maxSize = maxFileSize * 1000000;

  /**
   * This is a callback function that handles the drop event of the file upload.
   * It accepts an array of File objects, which represent the files that were dropped into the upload zone.
   * For each file, it creates a new FileReader object and reads the file as a data URL.
   * When the file is fully loaded, it logs the base64 encoded file data.
   * The function is wrapped in a useCallback hook to prevent unnecessary re-renders.
   *
   * @callback
   * @param {File[]} acceptedFiles - The files that were dropped into the upload zone.
   */
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onUpload?.(acceptedFiles);
  }, []);

  /**
   * validate file size , if size is over than 5MB show error
   * @param file
   */
  function sizeValidation(file: File) {
    const filesSize = files.reduce((prev, cur) => {
      prev += cur.size;
      return prev;
    }, 0);
    if (filesSize + file.size > maxSize) {
      return {
        code: "file is too big",
        message: `${t("max")} ${maxFileSize}MB!`,
      };
    }
    return null;
  }

  const { getRootProps, getInputProps, fileRejections } = useDropzone({
    onDrop,
    multiple,
    maxSize,
    disabled,
    maxFiles,

    accept: acceptedFiles,
    validator: sizeValidation,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "centered-col  w-full h-32 rounded border-2 border-dashed border-primary bg-primary-lighter p-4 transition-all duration-300 hover:bg-primary-light/40",
        className,
      )}
      {...divProps}
    >
      <div className="centered-col h-full w-full cursor-pointer gap-4 text-foreground-light">
        <input {...getInputProps()} onClick={e => e.stopPropagation()} />
        <AppIcon
          icon="mdi:progress-upload"
          width={24}
          className="text-primary"
        />
        <AppTypo
          variant="headingXS"
          type="h3"
          className="text-foreground-light"
        >
          {t("select_file")}
        </AppTypo>
        {children}
        <AppTypo variant="small" className="text-foreground-light">
          {`${t("max")} ${maxFileSize}MB / ${Object.keys(acceptedFiles)
            .map(key => {
              return key.split("/").pop()?.toUpperCase();
            })
            .join(", ")}`}
        </AppTypo>
        {fileRejections.map(({ errors }, index) => (
          <div key={index} className="text-destructive">
            {errors.map(e => (
              <p key={e.code}> {e.message}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadZone;
