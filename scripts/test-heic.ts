import { convertHeicWithImageMagick, isHeicFile } from './image-uploader';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

async function testHeicConversion() {
  // Find a HEIC file to test
  const testDir = join(homedir(), 'Downloads', 'oscarlisting', 'Factory', 'Kulai factory rent ');
  const files = await readdir(testDir);
  const heicFile = files.find(f => isHeicFile(join(testDir, f)));

  if (!heicFile) {
    console.log('No HEIC file found for testing');
    return;
  }

  const heicPath = join(testDir, heicFile);
  console.log(`Testing HEIC conversion: ${heicFile}`);
  console.log(`File path: ${heicPath}`);

  try {
    const buffer = await convertHeicWithImageMagick(heicPath);
    console.log(`✅ Conversion successful!`);
    console.log(`   Output size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
  } catch (error) {
    console.error(`❌ Conversion failed:`, error);
  }
}

testHeicConversion().then(() => process.exit(0));
