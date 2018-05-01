/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { flags } from '@oclif/command';
import Command from '../Command';

export default class SyncDotfilesCommand extends Command {
  static aliases = ['sync'];

  static description = 'Sync dotfiles from configuration module';

  static flags = {
    ...Command.flags,
    filter: flags.string({
      default: '',
      description: 'Filter filenames using a regex pattern',
      helpValue: 'pattern',
    }),
  };

  async run() {
    const { flags: options } = this.parse(SyncDotfilesCommand);

    this.log('Sup???');
  }
}
