/**
 * @copyright   2017-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { RequiredOptions } from 'prettier';

export interface PrettierConfig extends Partial<RequiredOptions> {
  ignore?: string[];
}

export interface PrettierArgs {
  arrowParens?: PrettierConfig['arrowParens'];
  bracketSpacing?: boolean;
  color?: boolean;
  config?: string | boolean;
  configPrecedence?: 'cli-override' | 'file-override' | 'prefer-file';
  cursorOffset?: number;
  editorconfig?: boolean;
  endOfLine?: PrettierConfig['endOfLine'];
  fileInfo?: string;
  findConfigPath?: string;
  h?: string | boolean;
  help?: string | boolean;
  htmlWhitespaceSensitivity?: PrettierConfig['htmlWhitespaceSensitivity'];
  ignorePath?: string;
  insertPragma?: boolean;
  jsxBracketSameLine?: boolean;
  jsxSingleQuote?: boolean;
  l?: boolean;
  listDifferent?: boolean;
  loglevel?: 'silent' | 'error' | 'warn' | 'log' | 'debug';
  parser?: PrettierConfig['parser'];
  plugin?: string;
  pluginSearchDir?: string;
  printWidth?: number;
  proseWrap?: PrettierConfig['proseWrap'];
  rangeEnd?: number;
  rangeStart?: number;
  requirePragma?: boolean;
  semi?: boolean;
  singleQuote?: boolean;
  stdin?: boolean;
  stdinFilepath?: string;
  supportInfo?: boolean;
  tabWidth?: number;
  trailingComma?: PrettierConfig['trailingComma'];
  useTabs?: boolean;
  v?: boolean;
  version?: boolean;
  withNodeModules?: boolean;
  write?: boolean;
}
