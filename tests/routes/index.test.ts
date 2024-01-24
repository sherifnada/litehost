import { inferContentRoot } from '../../src/routes/index.js';
import { Request, Response, NextFunction } from 'express';
import { validateUserSignedIn } from '../../src/routes/index.js';
import AdmZip from 'adm-zip';

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


// AUTHENTICATION
// Mock firebaseAdmin and its functions
import {getAuth} from 'firebase-admin/auth';

jest.mock('firebase-admin/auth', () => ({
    getAuth: jest.fn().mockReturnValue({
        verifyIdToken: jest.fn()
    })
}));
  
  // Utility function to create mock request
  const createMockRequest = (authorizationHeader?: string): Partial<Request> => ({
    headers: {
      authorization: authorizationHeader
    }
  });
  
  // Utility function to create mock response
  const createMockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  };
  
  describe('validateUserSignedIn', () => {
    it('should return 401 if verifyIdToken throws an error', async () => {
      const req = createMockRequest('Bearer validToken') as Request;
      const res = createMockResponse();
      const next: NextFunction = jest.fn();
  
      // Mocking verifyIdToken to simulate an error
      (getAuth().verifyIdToken as jest.Mock).mockRejectedValue(new Error('Invalid token'));
  
      // Call your middleware function
      await validateUserSignedIn(req, res, next);
  
      // Assertions
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({ error: "auth", message: "Invalid auth token" });
      expect(next).not.toHaveBeenCalled();
    });

    it('return 401 if no bearer token is provided', async() => {
        const req = createMockRequest();
        const res = createMockResponse();
        const next = jest.fn();

        await validateUserSignedIn(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for malformed bearer tokens', async () => {
        const malformedTokens = ['Bearer', 'Bearer123', 'Invalid bearer token', ''];
      
        for (const token of malformedTokens) {
          // Setup
          const req = createMockRequest(token);
          const res = createMockResponse();
          const next = jest.fn();
      
          // Execute
          await validateUserSignedIn(req, res, next);
      
          // Assert
          expect(res.status).toHaveBeenCalledWith(401);
          expect(res.send).toHaveBeenCalled();
          expect(next).not.toHaveBeenCalled();
        }
      });

      it('should call next() if bearer token is valid', async () => {
        // Setup
        const req = createMockRequest('Bearer validToken');
        const res = createMockResponse();
        const next = jest.fn();
      
        // Mock verifyIdToken to resolve
        (getAuth().verifyIdToken as jest.Mock).mockResolvedValue({ uid: '12345' });
      
        // Execute
        await validateUserSignedIn(req, res, next);
      
        // Assert
        console.log(req);
        expect(res.status).not.toHaveBeenCalled();
        expect(req).toHaveProperty('userToken');
        
        expect(next).toHaveBeenCalled();
      });
      
      
  });

