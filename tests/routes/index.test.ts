import { inferContentRoot } from '../../src/routes/index.js';
import AdmZip from 'adm-zip';

jest.mock('adm-zip');

describe('inferContentRoot', () => {
    let mockZipFile;

    beforeEach(() => {
        mockZipFile = new AdmZip();
    });

    it('should throw ValidationError with status 400 if zip file contains no index.html', () => {
        mockZipFile.getEntries.mockReturnValue([]);
        expect(() => inferContentRoot(mockZipFile)).toThrow(expect.objectContaining({
            name: 'ValidationError',
            status: 400
        }));
    });

    it('should return correct path if zip file contains a single index.html at root', () => {
        mockZipFile.getEntries.mockReturnValue([{ entryName: 'index.html' }, {entryName: "favicon.ico"}, {entryName: "404.html"}]);
        expect(inferContentRoot(mockZipFile)).toBe('');
    });

    it('should return correct path if zip file contains a single index.html a couple of folders deep', () => {
        mockZipFile.getEntries.mockReturnValue([{ entryName: 'folder1/folder2/index.html' }]);
        expect(inferContentRoot(mockZipFile)).toBe('folder1/folder2');
    });

    it('should return correct path if zip file contains a single index.html a single folder deep', () => {
        mockZipFile.getEntries.mockReturnValue([{ entryName: 'folder1/index.html' }]);
        expect(inferContentRoot(mockZipFile)).toBe('folder1');
    });

    it('should throw ValidationError with status 400 if there are two directories at the same depth with an index.html', () => {
        mockZipFile.getEntries.mockReturnValue([
            { entryName: 'folder1/index.html' },
            { entryName: 'folder2/index.html' }
        ]);
        expect(() => inferContentRoot(mockZipFile)).toThrow(expect.objectContaining({
            name: 'ValidationError',
            status: 400
        }));
    });

    it('should throw ValidationError with status 400 if there are two directories at a deeper level with an index.html', () => {
        mockZipFile.getEntries.mockReturnValue([
            { entryName: 'folder1/folder2/index.html' },
            { entryName: 'folder1/folder3/index.html' }
        ]);
        expect(() => inferContentRoot(mockZipFile)).toThrow(expect.objectContaining({
            name: 'ValidationError',
            status: 400
        }));
    });

    it('should throw ValidationError with status 400 if there are two directories at a very deep level with an index.html', () => {
        mockZipFile.getEntries.mockReturnValue([
            { entryName: 'folder1/folder2/folder3/folder4/index.html' },
            { entryName: 'folder1/folder2/folder3/folder5/index.html' }
        ]);
        expect(() => inferContentRoot(mockZipFile)).toThrow(expect.objectContaining({
            name: 'ValidationError',
            status: 400
        }));
    });

    it('should not throw an exception if there are multiple index.html files but only one at the shallowest depth level', () => {
        mockZipFile.getEntries.mockReturnValue([
            { entryName: 'index.html' },
            { entryName: 'folder1/folder2/index.html' },
            { entryName: 'folder1/folder2/folder3/index.html' }
        ]);
        expect(inferContentRoot(mockZipFile)).toBe('');
    });

    it('should not throw an exception if there are multiple index.html files at various depths but only one at the shallowest depth level', () => {
        mockZipFile.getEntries.mockReturnValue([
            { entryName: 'folder1/index.html' },
            { entryName: 'folder1/folder2/folder3/index.html' },
            { entryName: 'folder2/folder3/folder4/index.html' }
        ]);
        expect(inferContentRoot(mockZipFile)).toBe('folder1');
    });
});