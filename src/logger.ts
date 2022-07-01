export const rkColor = (text: any) => `\u001B[35m${text}\u001B[39m`;
export const rkLog = (text: any) =>
  console.log(`${rkColor('⚡')}: ${text}`);
export const rkPluginLog = (name: string, text: any) =>
  console.log(`${rkColor(`⚡${name} `)}: ${text}`);
