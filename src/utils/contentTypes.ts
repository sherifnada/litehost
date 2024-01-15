function getContentTypeFromFileName(fileName: string): string {
    const fileExtension = fileName.split('.').pop();
    switch(fileExtension) {
        case 'html':
            return 'text/html';
        case 'css':
            return 'text/css';
        case 'js':
            return 'application/javascript';
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'png':
            return 'image/png';
        case 'gif':
            return 'image/gif';
        default:
            return 'application/octet-stream';
    }
}

export default getContentTypeFromFileName;
