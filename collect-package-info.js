const fs = require('fs').promises;
const path = require('path');

async function collectPackageInfo() {
  try {
    // Get all directories in the packages folder
    const packagesDir = path.join(process.cwd(), 'packages');
    const packages = await fs.readdir(packagesDir);

    // Array to store all package info
    const allPackageInfo = [];

    // Iterate through each package directory
    for (const pkg of packages) {
      const packagePath = path.join(packagesDir, pkg);
      const stat = await fs.stat(packagePath);

      // Check if it's a directory
      if (stat.isDirectory()) {
        try {
          // Read package-info.json from the package directory
          const infoPath = path.join(packagePath, 'package-info.json');
          const infoContent = await fs.readFile(infoPath, 'utf8');
          const packageInfo = JSON.parse(infoContent);

          // Add the package info to our array
          allPackageInfo.push(packageInfo);
        } catch (err) {
          console.warn(
            `Warning: Could not read package-info.json from ${pkg}:`,
            err.message,
          );
        }
      }
    }

    // Write the combined data to packages-info.json in the root
    await fs.writeFile(
      'packages-info.json',
      JSON.stringify(allPackageInfo, null, 2),
      'utf8',
    );

    console.log('Successfully created packages-info.json');
    console.log(`Found ${allPackageInfo.length} package(s)`);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

// Run the script
collectPackageInfo();
