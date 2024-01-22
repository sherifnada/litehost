import AdmZip from "adm-zip";

import { tmpdir } from "os";
import * as path from "path";

function getTmpDir(): string{
    const baseTmpDir = tmpdir();
    const randomDirName = `tmp-${Math.random().toString(36).substr(2, 9)}`; // Generates a random directory name
    return path.join(baseTmpDir, randomDirName);

}

function listZipfileContents(zipfile: AdmZip, keepMacMetadata: boolean = false): Array<string> {
    return zipfile.getEntries().filter(entry => {
        const isMacMetadataEntry = entry.entryName.startsWith("__MACOSX");
        return (isMacMetadataEntry && keepMacMetadata) || !isMacMetadataEntry;
    })
    .map(entry => entry.entryName);
}

function zipfileContains(fullFilePath: string, zipFile: AdmZip): boolean {
    for (const name of listZipfileContents(zipFile)){
        if (name == fullFilePath || name === `${fullFilePath}/`) return true;
    }
    return false;
}

function unzipToTmpDir(zip: AdmZip): string {
    /**
     * Returns the tmpdir into which the zip file was extracted
     */
    const tmpDir = getTmpDir();
    zip.extractAllTo(tmpDir, true);
    return tmpDir;
}



export {unzipToTmpDir, listZipfileContents, zipfileContains}