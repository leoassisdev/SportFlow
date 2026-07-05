import { BlobServiceClient } from '@azure/storage-blob';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { env } from '../../config/env.js';
import { logger } from '../../shared/logger.js';

interface UploadResult {
  url: string;
  storage: 'azure' | 'local';
}

/**
 * Upload de arquivo com fallback local. Em producao usa Azure Blob; em dev
 * ou sem creds, escreve em /tmp/sportflow-exports e serve com URL fake.
 */
export const uploadExport = async (
  buffer: Buffer,
  filename: string,
  contentType: string,
): Promise<UploadResult> => {
  if (env.AZURE_BLOB_CONNECTION_STRING) {
    try {
      const svc = BlobServiceClient.fromConnectionString(env.AZURE_BLOB_CONNECTION_STRING);
      const container = svc.getContainerClient(env.AZURE_BLOB_CONTAINER);
      await container.createIfNotExists();
      const blob = container.getBlockBlobClient(filename);
      await blob.uploadData(buffer, { blobHTTPHeaders: { blobContentType: contentType } });
      // Signed URL: em prod real, gerar SAS aqui. Por ora, retornar URL direta.
      return { url: blob.url, storage: 'azure' };
    } catch (err) {
      logger.warn({ err }, 'Azure Blob upload falhou, fallback local');
    }
  }

  const dir = '/tmp/sportflow-exports';
  await mkdir(dir, { recursive: true });
  const path = join(dir, filename);
  await writeFile(path, buffer);
  return { url: `file://${path}`, storage: 'local' };
};
