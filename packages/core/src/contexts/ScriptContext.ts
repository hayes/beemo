/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import Context from './Context';
import Script from '../Script';
import { Arguments } from '../types';

export default class ScriptContext extends Context {
  script: Script | null = null;

  scriptName: string = '';

  scriptPath: string = '';

  constructor(args: Arguments, name: string) {
    super(args);

    this.scriptName = name;
  }

  /**
   * Set the script object and associated metadata.
   */
  setScript(script: Script, path: string) {
    this.script = script;
    this.scriptName = script.name;
    this.scriptPath = path;
  }
}
