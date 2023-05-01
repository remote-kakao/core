export const rkColor = (text: string) => `\u001B[35m${text}\u001B[39m`;
export const rkLog = (text: string) => console.log(`${rkColor('⚡')}: ${text}`);

export const readyLog = (serviceName?: string, port?: number) =>
  console.log(
    `${rkColor('⚡')}: ${
      serviceName ? `${rkColor(serviceName)} l` : 'L'
    }istening${port ? ` on port ${rkColor(port.toString())}` : ''}!\n`,
  );
export const rkPluginLog = (name: string, text: string) =>
  console.log(`${rkColor(`⚡${name}`)}: ${text}`);
