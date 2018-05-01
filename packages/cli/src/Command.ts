import { Command, flags } from '@oclif/command';

export default abstract class BaseCommand extends Command {
  static description = 'Base command with shared functionality';

  static flags = {
    debug: flags.boolean({
      char: 'd',
      description: 'Show debug messages',
    }),
    help: flags.help({
      char: 'h',
      description: 'Show help information',
    }),
    silent: flags.boolean({
      description: 'Hide all generated output',
    }),
    verbose: flags.option({
      default: 0,
      description: 'Increase generated output',
      multiple: true,
      options: ['1', '2', '3'],
      parse: Number,
    }),
    version: flags.version({
      char: 'v',
      description: 'Show version number',
    }),
  };
}
