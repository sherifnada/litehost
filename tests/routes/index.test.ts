import { inferContentRoot } from '../../src/routes/index.js';
import AdmZip from 'adm-zip';
// jest.mock('adm-zip');

describe('inferContentRoot', () => {
    let mockZipFile;

    beforeEach(() => {
        jest.clearAllMocks();
        mockZipFile = new AdmZip();
    });

    it('throw if contains no index.html', () => {
        mockZipFile.getEntries = jest.fn().mockReturnValue([]);
        expect(() => inferContentRoot(mockZipFile)).toThrow(expect.objectContaining({
            name: 'ValidationError',
            status: 400
        }));
    });

    it('single index.html at root', () => {
        mockZipFile.getEntries = jest.fn().mockReturnValue([{ entryName: 'index.html' }, {entryName: "favicon.ico"}, {entryName: "404.html"}]);
        expect(inferContentRoot(mockZipFile)).toBe('');
    });

    it('single index.html a couple of folders deep', () => {
        mockZipFile.getEntries = jest.fn().mockReturnValue([{ entryName: 'folder1/folder2/index.html' }]);
        expect(inferContentRoot(mockZipFile)).toBe('folder1/folder2');
    });

    it('single index.html a single folder deep', () => {
        mockZipFile.getEntries = jest.fn().mockReturnValue([{ entryName: 'folder1/index.html' }]);
        expect(inferContentRoot(mockZipFile)).toBe('folder1');
    });

    it('throw if two directories at the same depth have index.html', () => {
        mockZipFile.getEntries = jest.fn().mockReturnValue([
            { entryName: 'folder1/index.html' },
            { entryName: 'folder2/index.html' }
        ]);
        expect(() => inferContentRoot(mockZipFile)).toThrow(expect.objectContaining({
            name: 'ValidationError',
            status: 400
        }));
    });

    it('throw if two directories at a deeper level with an index.html', () => {
        mockZipFile.getEntries = jest.fn().mockReturnValue([
            { entryName: 'folder1/folder2/index.html' },
            { entryName: 'folder1/folder3/index.html' }
        ]);
        expect(() => inferContentRoot(mockZipFile)).toThrow(expect.objectContaining({
            name: 'ValidationError',
            status: 400
        }));
    });

    it('throw if two directories at a very deep level with an index.html', () => {
        mockZipFile.getEntries = jest.fn().mockReturnValue([
            { entryName: 'folder1/folder2/folder3/folder4/index.html' },
            { entryName: 'folder1/folder2/folder3/folder5/index.html' }
        ]);
        expect(() => inferContentRoot(mockZipFile)).toThrow(expect.objectContaining({
            name: 'ValidationError',
            status: 400
        }));
    });

    it('multiple index.html but only one at the shallowest level', () => {
        mockZipFile.getEntries = jest.fn().mockReturnValue([
            { entryName: 'index.html' },
            { entryName: 'folder1/folder2/index.html' },
            { entryName: 'folder1/folder2/folder3/index.html' }
        ]);
        expect(inferContentRoot(mockZipFile)).toBe('');
    });

    it('multiple index.html files at various depths but only one at the shallowest depth level', () => {
        mockZipFile.getEntries = jest.fn().mockReturnValue([
            { entryName: 'folder1/index.html' },
            { entryName: 'folder1/folder2/folder3/index.html' },
            { entryName: 'folder2/folder3/folder4/index.html' }
        ]);
        expect(inferContentRoot(mockZipFile)).toBe('folder1');
    });
});