/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { Hook } from '@oclif/config';

const hook: Hook<'init'> = async function init(options) {
  console.log(this.config.plugins, this.config.plugins[0]);
};

export default hook;
