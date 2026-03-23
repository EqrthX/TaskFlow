process.env.AZURE_STORAGE_CONNECTION_STRING = 'DefaultEndpointsProtocol=https;AccountName=test;AccountKey=test;EndpointSuffix=core.windows.net';

const mockUploadData = jest.fn().mockResolvedValue(true);
const mockGetBlockBlobClient = jest.fn(() => ({
    uploadData: mockUploadData,
    url: 'https://test.blob.core.windows.net/task-images/mock-uuid-1234.png'
}));

jest.mock('@azure/storage-blob', () => ({
    BlobServiceClient: {
        fromConnectionString: jest.fn(() => ({
            getContainerClient: jest.fn(() => ({
                getBlockBlobClient: (...args: any[]) => mockGetBlockBlobClient(...args)
            }))
        }))
    }
}));

jest.mock('uuid', () => ({ v4: () => 'mock-uuid-1234' }));

import { uploadImageToAzure } from '../../src/services/azureStorage';

describe('Azure Storage Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUploadData.mockResolvedValue(true);
    });

    it('ควรแปลงชื่อไฟล์ อัปโหลดข้อมูล และคืนค่า URL กลับมาได้สำเร็จ', async () => {
        const mockFile: Express.Multer.File = {
            originalname: 'test-image.png',
            mimetype: 'image/png',
            buffer: Buffer.from('fake-image-data'),
        } as any;

        const result = await uploadImageToAzure(mockFile);

        expect(mockGetBlockBlobClient).toHaveBeenCalledWith('mock-uuid-1234.png');
        expect(mockUploadData).toHaveBeenCalledWith(mockFile.buffer, {
            blobHTTPHeaders: { blobContentType: 'image/png' }
        });
        expect(result).toBe('https://test.blob.core.windows.net/task-images/mock-uuid-1234.png');
    });
});