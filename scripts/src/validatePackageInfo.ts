import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { z } from 'zod';
import { PackageInfo } from './types.js';
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
    const result = PackageInfo.safeParse(content);

    if (!result.success) {
      return {
        file: filePath,
        errors: result.error.errors.map(
          err => `${err.path.join('.')}: ${err.message}`,
        ),
      };
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
  const packageInfoFiles = glob.sync('packages/**/package-info.json');

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
