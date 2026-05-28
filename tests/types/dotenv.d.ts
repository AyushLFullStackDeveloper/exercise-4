/**
 * Type declarations for modules that don't ship their own .d.ts files.
 * This file is auto-loaded by TypeScript via tsconfig.json include.
 */

// dotenv v10 does not bundle TypeScript declarations.
// We provide a minimal ambient declaration here to satisfy the compiler.
declare module 'dotenv' {
  interface DotenvConfigOptions {
    path?: string;
    encoding?: string;
    debug?: boolean;
    override?: boolean;
  }
  interface DotenvConfigOutput {
    parsed?: Record<string, string>;
    error?: Error;
  }
  function config(options?: DotenvConfigOptions): DotenvConfigOutput;
  export { config };
}
