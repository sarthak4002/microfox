import fs from 'fs';
import path from 'path';

/**
 * List all packages in the packages directory and save their paths to packages-list.json
 * Organizes packages by their status (stable, beta, etc.)
 */
async function updatePackageList() {
  try {
    console.log('📁 Scanning packages directory...');

    // Get the packages directory path
    const packagesDir = path.join(process.cwd(), '../packages');
    const outputPath = path.join(process.cwd(), '../packages-list.json');

    // Check if packages directory exists
    if (!fs.existsSync(packagesDir)) {
      console.log('⚠️ No packages directory found');
      return;
    }

    // Read all directories in packages folder
    const packageDirs = fs.readdirSync(packagesDir).filter(file => {
      const fullPath = path.join(packagesDir, file);
      return fs.statSync(fullPath).isDirectory();
    });

    // Initialize status-based package arrays
    const statusPackages: Record<string, string[]> = {};
    // Process each package directory
    for (const dir of packageDirs) {
      const packageInfoPath = path.join(packagesDir, dir, 'package-info.json');

      // Check if package-info.json exists
      if (fs.existsSync(packageInfoPath)) {
        try {
          const packageInfo = JSON.parse(
            fs.readFileSync(packageInfoPath, 'utf8'),
          );
          const status = packageInfo.status || 'unknown';
          const index = `${status}Packages`;

          // Initialize array for this index if it doesn't exist
          if (!statusPackages[index]) {
            statusPackages[index] = [];
          }

          // Add package to the appropriate index array
          statusPackages[index].push(`packages/${dir}`);
        } catch (error) {
          console.warn(`⚠️ Error reading package-info.json for ${dir}:`, error);
        }
      } else {
        console.warn(`⚠️ No package-info.json found for ${dir}`);
      }
    }

    // Create the output object
    const newOutput = {
      ...statusPackages,
      total: packageDirs.length,
      generatedAt: new Date().toISOString(),
    };

    // Read existing file if it exists
    let shouldUpdate = true;
    if (fs.existsSync(outputPath)) {
      const existingContent = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
      const { generatedAt: _, ...existingData } = existingContent;
      const { generatedAt: __, ...newData } = newOutput;

      shouldUpdate = JSON.stringify(existingData) !== JSON.stringify(newData);
    }

    if (shouldUpdate) {
      // Write to packages-list.json
      fs.writeFileSync(outputPath, JSON.stringify(newOutput, null, 2));
      console.log('📝 Updated package list in packages-list.json');
    } else {
      console.log('ℹ️ No changes detected in package data, skipping update');
    }

    console.log(`✅ Found ${packageDirs.length} packages`);

    // Log status counts
    Object.entries(statusPackages).forEach(([status, packages]) => {
      console.log(`📊 ${status}: ${packages.length} packages`);
    });
  } catch (error) {
    console.error('❌ Error listing packages:', error);
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  updatePackageList();
}
