import fs from 'fs';
import path from 'path';

/**
 * List all packages in the packages directory and save their paths to packages-list.json
 */
async function updatePackageList() {
  try {
    console.log('📁 Scanning packages directory...');

    // Get the packages directory path
    const packagesDir = path.join(process.cwd(), '../packages');

    // Check if packages directory exists
    if (!fs.existsSync(packagesDir)) {
      console.log('⚠️ No packages directory found');
      return;
    }

    // Read all directories in packages folder
    const packageDirs = fs
      .readdirSync(packagesDir)
      .filter(file => {
        const fullPath = path.join(packagesDir, file);
        return fs.statSync(fullPath).isDirectory();
      })
      .map(dir => `packages/${dir}`);

    // Create the output object
    const output = {
      packages: packageDirs,
      total: packageDirs.length,
      generatedAt: new Date().toISOString(),
    };

    // Write to packages-list.json
    fs.writeFileSync(
      path.join(process.cwd(), '../packages-list.json'),
      JSON.stringify(output, null, 2),
    );

    console.log(`✅ Found ${packageDirs.length} packages`);
    console.log('📝 Saved package list to packages-list.json');
  } catch (error) {
    console.error('❌ Error listing packages:', error);
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  updatePackageList();
}
