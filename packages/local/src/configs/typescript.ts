import { TypeScriptConfig } from '@beemo/driver-typescript';
import baseConfig from '@milesj/build-tool-config/configs/typescript';

const config: TypeScriptConfig = {
  ...baseConfig,
  compilerOptions: {
    ...baseConfig.compilerOptions,
    useDefineForClassFields: false,
  },
};

export default config;