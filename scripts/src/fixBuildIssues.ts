import { buildPackage } from './utils/execCommands';
import { fixPackage } from './fixPackage';
import path from 'path';

const MAX_RETRIES = 5;

export async function fixBuildIssues(packageDir: string) {
  console.log(`🛠️ Starting iterative build and fix process for ${packageDir}`);
  console.log(`🔄 Maximum retries: ${MAX_RETRIES}`);

  let buildSucceeded = false;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log(`\n--- Attempt ${attempt} of ${MAX_RETRIES} ---`);

    console.log(`\n[Attempt ${attempt}] ⏳ Building package: ${packageDir}`);
    const buildResult = await buildPackage(packageDir);

    if (buildResult) {
      console.log(
        `\n[Attempt ${attempt}] ✅ Build successful for ${packageDir}! No further fixes needed.`,
      );
      buildSucceeded = true;
      break; // Exit loop on successful build
    } else {
      console.warn(
        `\n[Attempt ${attempt}] ⚠️ Build failed for ${packageDir}. Attempting to fix...`,
      );
      try {
        await fixPackage(); // Run the fix process
        console.log(
          `\n[Attempt ${attempt}] ✨ Fix process completed. Retrying build...`,
        );
      } catch (fixError) {
        console.error(
          `\n[Attempt ${attempt}] ❌ Critical error during fix process:`,
          fixError,
        );
        console.error(
          `Aborting fix attempts for ${packageDir} due to error in fixPackage.`,
        );
        break; // Stop if fixPackage itself errors critically
      }
    }
  }

  if (buildSucceeded) {
    console.log(
      `\n🎉 Successfully built ${packageDir} within ${MAX_RETRIES} attempts.`,
    );
    process.exitCode = 0;
  } else {
    console.error(
      `\n❌ Failed to build ${packageDir} after ${MAX_RETRIES} attempts. Please review logs and fix manually.`,
    );
    process.exitCode = 1; // Indicate failure
  }
}

// --- Script Execution ---
if (require.main === module) {
  const args = process.argv.slice(2); // Get command line arguments, excluding node and script name

  if (args.length !== 1) {
    console.error(
      'Usage: ts-node scripts/src/fixBuildIssues.ts <package-slug>',
    );
    console.error(
      'Example: ts-node scripts/src/fixBuildIssues.ts @microfox/youtube-analytics',
    );
    process.exit(1);
  }

  const packagePathArg = args[0];
  // Resolve the absolute path relative to the monorepo root (assuming scripts is one level down)
  const absolutePackageDir = path.resolve(
    process.cwd(),
    '..',
    packagePathArg.replace('@microfox/', 'packages/'),
  );

  // Basic check if the directory might exist (can be improved)
  // Consider adding fs.existsSync if needed, but buildPackage might handle it
  if (!packagePathArg) {
    console.error('Error: Package directory path cannot be empty.');
    process.exit(1);
  }

  fixBuildIssues(absolutePackageDir).catch(error => {
    console.error('❌ Unhandled error during the fix process:', error);
    process.exit(1);
  });
}
