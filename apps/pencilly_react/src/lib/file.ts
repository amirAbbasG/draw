export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (like "data:image/png;base64,") and return only the base64 content
      const base64Content = result.split(",")[1];
      resolve(base64Content);
    };
    reader.readAsDataURL(blob);
  });
}

export async function getBlobImageDimensions(
  blob: Blob,
): Promise<{ width: number; height: number }> {
  const objectUrl = URL.createObjectURL(blob);
  const imgForSize = new Image();

  const { width, height } = await new Promise<{
    width: number;
    height: number;
  }>((resolve, reject) => {
    imgForSize.onload = () => {
      resolve({
        width: imgForSize.naturalWidth || imgForSize.width || 500,
        height: imgForSize.naturalHeight || imgForSize.height || 500,
      });
    };
    imgForSize.onerror = err => reject(err);
    imgForSize.src = objectUrl;
  });

  URL.revokeObjectURL(objectUrl);
  return { width, height };
}
