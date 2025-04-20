import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { z } from 'zod';
import { PackageInfo } from './types';
import fs from 'fs';
import path from 'path';
import { glob, globSync } from 'glob';

interface ValidationError {
  file: string;
  errors: string[];
}

function validatePackageInfo(filePath: string): ValidationError | null {
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // First check if the file has a valid status field
    if (
      content.status &&
      (content.status === 'semiStable' || content.status === 'stable')
    ) {
      // Only perform full validation for semiStable or stable packages
      const result = PackageInfo.safeParse(content);

      if (!result.success) {
        return {
          file: filePath,
          errors: result.error.errors.map(
            err => `${err.path.join('.')}: ${err.message}`,
          ),
        };
      }
    } else {
      // For unstable packages, just check if it's valid JSON
      // No need to validate against the full schema
      console.log(
        `Skipping full validation for ${filePath} (status: ${content.status || 'unknown'})`,
      );
    }

    return null;
  } catch (error) {
    return {
      file: filePath,
      errors: [
        `Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ],
    };
  }
}

function validateAllPackageInfos(): ValidationError[] {
  const errors: ValidationError[] = [];

  // Get the project root directory (two levels up from the script location)
  const scriptDir = __dirname;
  const projectRoot = path.resolve(scriptDir, '../../');

  // Use path.join to create a path relative to the project root
  const packageInfoPattern = path.join(
    projectRoot,
    'packages/**/package-info.json',
  );
  const packageInfoFiles = globSync(packageInfoPattern);

  for (const file of packageInfoFiles) {
    const error = validatePackageInfo(file);
    if (error) {
      errors.push(error);
    }
  }

  return errors;
}

// For GitHub Actions
if (require.main === module) {
  const errors = validateAllPackageInfos();
  if (errors.length > 0) {
    console.log('::set-output name=has_errors::true');
    console.log(
      '::set-output name=error_message::' +
        JSON.stringify(
          errors.map(err => ({
            file: err.file,
            errors: err.errors,
          })),
        ),
    );
    process.exit(1);
  } else {
    console.log('::set-output name=has_errors::false');
    console.log('All package info files are valid! ✨');
    process.exit(0);
  }
}
