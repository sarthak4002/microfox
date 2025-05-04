import { buildPackage } from './utils/execCommands';
import { fixPackage } from './fixPackage';
import path from 'path';
import fs from 'fs';
import {
  prCommentor,
  updateBuildReport,
  readUsageData,
} from './octokit/octokit';
import { IssueDetails, PackageFoxRequest } from './process-issue';

const MAX_RETRIES = 2;

export async function fixBuildIssues(packageName: string) {
  console.log(`🛠️ Starting iterative build and fix process for ${packageName}`);
  console.log(`🔄 Maximum retries: ${MAX_RETRIES}`);

  const dirName = packageName.replace('@microfox/', '');
  const packageDir = path.join(
    process.cwd().replace('/scripts', ''),
    './packages',
    dirName,
  );

  let buildSucceeded = false;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log(`\n--- Attempt ${attempt} of ${MAX_RETRIES} ---`);

    console.log(`\n[Attempt ${attempt}] ⏳ Building package: ${packageDir}`);
    await updateBuildReport(
      'build',
      {
        status: 'in-progress',
        details: { attempt: `${attempt}/${MAX_RETRIES}` },
      },
      packageDir,
    );

    const buildResult = await buildPackage(packageDir);

    if (buildResult) {
      console.log(
        `\n[Attempt ${attempt}] ✅ Build successful for ${packageDir}! No further fixes needed.`,
      );
      await updateBuildReport(
        'build',
        {
          status: 'success',
          details: { attempt: `${attempt}/${MAX_RETRIES}` },
        },
        packageDir,
      );
      buildSucceeded = true;
      break; // Exit loop on successful build
    } else {
      console.warn(
        `\n[Attempt ${attempt}] ⚠️ Build failed for ${packageDir}. Attempting to fix...`,
      );
      await updateBuildReport(
        'build',
        {
          status: 'failure',
          details: { attempt: `${attempt}/${MAX_RETRIES}` },
        },
        packageDir,
      );

      try {
        await updateBuildReport(
          'fix',
          {
            status: 'in-progress',
            details: { attempt: `${attempt}/${MAX_RETRIES}` },
          },
          packageDir,
        );
        await fixPackage(); // Run the fix process
        await updateBuildReport(
          'fix',
          {
            status: 'success',
            details: { attempt: `${attempt}/${MAX_RETRIES}` },
          },
          packageDir,
        );
        console.log(
          `\n[Attempt ${attempt}] ✨ Fix process completed. Retrying build...`,
        );
      } catch (fixError) {
        console.error(
          `\n[Attempt ${attempt}] ❌ Critical error during fix process:`,
          fixError,
        );
        await updateBuildReport(
          'fix',
          {
            status: 'failure',
            details: { attempt: `${attempt}/${MAX_RETRIES}` },
            error: fixError,
          },
          packageDir,
        );
        console.error(
          `Aborting fix attempts for ${packageDir} due to error in fixPackage.`,
        );
        break; // Stop if fixPackage itself errors critically
      }
    }
  }

  const foxlog = fs.readFileSync(
    path.join(
      process.cwd()?.replace('/scripts', ''),
      '.microfox/packagefox-build.json',
    ),
    'utf8',
  );
  if (foxlog) {
    const foxlogData = JSON.parse(foxlog);
    const newRequests: any[] = [];
    foxlogData.requests.forEach((request: PackageFoxRequest) => {
      if (request.packageName === packageName && request.type === 'pkg-build') {
      } else {
        newRequests.push(request);
      }
    });
    foxlogData.requests = newRequests;
    fs.writeFileSync(
      path.join(process.cwd(), '.microfox/packagefox-build.json'),
      JSON.stringify(foxlogData, null, 2),
    );
  }

  if (buildSucceeded) {
    console.log(
      `\n🎉 Successfully built ${packageDir} within ${MAX_RETRIES} attempts.`,
    );
    const packageInfo = JSON.parse(
      fs.readFileSync(path.join(packageDir, 'package-info.json'), 'utf8'),
    );
    const totalUsage = readUsageData(packageDir);
    prCommentor.createComment({
      body: `
      # 🎉 Successfully built ${packageName} 😉

      Fantastic! Your package ${packageName} has been built successfully and is ready to rock! 🚀

      ## 📊 Package Stats
      - Total Functions: ${packageInfo.readme_map.functionalities.length} powerful functionalities at your fingertips
      - Estimated Build Cost: $${totalUsage?.totalCost}$
      - Authentication: ${packageInfo.authType} based security
      
      ## 📦 Where to Find Your Package
      
      ✨ GitHub: Check out the complete source in [packages/${packageName.replace('@microfox/', '')}](https://github.com/microfox-ai/microfox/tree/main/packages/${packageName.replace('@microfox/', '')})
      
      📥 NPM: Ready to install from the [NPM registry](https://www.npmjs.com/package/${packageName.replace('@microfox/', '')})
      run \`npm install ${packageName}\` to install the package.

      Note: we will deploy all built packages at the midnight hour. so will have to wait until then to use the package.
      
      ## 🤝 Join us
      
      Join our amazing developer community on [Discord](https://discord.gg/kUuJFvEtJ6) - we're on a mission to build something incredible together (100% opensource all software)!
      
      Keep building awesome things! 🌟
      
      With excitement,
      Your Microfox 🦊
      
      P.S. Don't forget to star ⭐ our repo if you like what we're doing!
      `,
    });
    process.exitCode = 0;
  } else {
    console.error(
      `\n❌ Failed to build ${packageDir} after ${MAX_RETRIES} attempts. Please review logs and fix manually.`,
    );
    //process.exitCode = 1; // Indicate failure
    prCommentor.createComment({
      body: `❌ Failed to build ${packageDir} after ${MAX_RETRIES} attempts. Please review logs and fix manually.`,
    });
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

  // Basic check if the directory might exist (can be improved)
  // Consider adding fs.existsSync if needed, but buildPackage might handle it
  if (!packagePathArg) {
    console.error('Error: Package directory path cannot be empty.');
    process.exit(1);
  }

  fixBuildIssues(packagePathArg).catch(error => {
    console.error('❌ Unhandled error during the fix process:', error);
    process.exit(1);
  });
}
