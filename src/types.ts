export interface Config {
  [key: string]: string | number | boolean | undefined | Config;
}
export interface Data {
  [key: string]: string | number | boolean | undefined | Data;
}
