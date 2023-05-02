export interface Config {
  [key: string]: string | number | boolean | undefined | Config;
}
