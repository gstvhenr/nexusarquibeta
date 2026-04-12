import type { DocumentFile } from '../types';
import { firebaseFileService } from '../services/infrastructure/firebaseFileService';

export const fileToB64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const dataUrlToBlob = (dataUrl: string): Blob => {
  const [header, data] = dataUrl.split(',');
  const mimeMatch = header.match(/data:(.*?);base64/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const byteString = atob(data);
  const byteArray = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i += 1) {
    byteArray[i] = byteString.charCodeAt(i);
  }
  return new Blob([byteArray], { type: mimeType });
};

export const openDocument = async (file: DocumentFile) => {
  const source = file.sources.find((s) => s.id === file.primarySourceId);
  if (!source) return;

  if (source.type === 'link') {
    console.warn('Links externos desativados no modo offline.');
    return;
  }

  if (source.type === 'upload' && source.storagePath) {
    try {
      const url = await firebaseFileService.getFileUrl(source.storagePath);
      if (!url) {
        return;
      }

      const a = document.createElement('a');
      a.href = url;

      const isViewable =
        source.fileType?.startsWith('image/') || source.fileType === 'application/pdf';

      if (isViewable) {
        a.target = '_blank';
      } else {
        a.download = source.fileName || 'download';
      }

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    } catch (error) {
      console.error('Error opening Firebase document:', error);
    }
  }

  if (source.type === 'upload' && source.content) {
    try {
      const blob = dataUrlToBlob(source.content);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const isViewable =
        source.fileType?.startsWith('image/') || source.fileType === 'application/pdf';

      if (isViewable) {
        a.target = '_blank';
      } else {
        a.download = source.fileName || 'download';
      }

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error opening file:', error);
    }
  }
};
