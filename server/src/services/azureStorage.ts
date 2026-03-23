import * as dotenv from "dotenv";
dotenv.config();

import { BlobServiceClient } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const containerName = 'task-images';

export const uploadImageToAzure = async (file: Express.Multer.File): Promise<string> => {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;

    if (!connectionString) {
        throw new Error("Missing Azure Connection String");
    }

    // ✅ Moved inside the function — now mockable in tests
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const extension = path.extname(file.originalname);
    const blobName = `${uuidv4()}${extension}`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: { blobContentType: file.mimetype }
    });

    return blockBlobClient.url;
};