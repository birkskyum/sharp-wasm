'use strict';

const detectLibc = require('detect-libc');

const env = process.env;

/* istanbul ignore next */
if ('webcontainer' in process.versions) {
  env.npm_config_arch = 'wasm32';
}

module.exports = function () {
  const arch = env.npm_config_arch || process.arch;

  /* istanbul ignore next */
  if (arch.startsWith('wasm')) {
    // Ignore the actual platform and libc for WebAssembly targets.
    return `emscripten-${arch}`;
  }

  const platform = env.npm_config_platform || process.platform;
  const libc = process.env.npm_config_libc ||
    /* istanbul ignore next */
    (detectLibc.isNonGlibcLinuxSync() ? detectLibc.familySync() : '');
  const libcId = platform !== 'linux' || libc === detectLibc.GLIBC ? '' : libc;

  const platformId = [`${platform}${libcId}`];

  if (arch === 'arm') {
    const fallback = process.versions.electron ? '7' : '6';
    platformId.push(`armv${env.npm_config_arm_version || process.config.variables.arm_version || fallback}`);
  } else if (arch === 'arm64') {
    platformId.push(`arm64v${env.npm_config_arm_version || '8'}`);
  } else {
    platformId.push(arch);
  }

  return platformId.join('-');
};
