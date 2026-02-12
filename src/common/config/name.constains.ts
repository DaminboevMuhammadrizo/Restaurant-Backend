
export interface IAppConfig {
  host: string;
  port: number;
  origins: string;
  globalPrefix: string;
  docPassword: string;
  nodeEnv: string;
}

export enum ConfigNames {
  APP = 'app',
  REDIS = 'redis',
  JWT = 'jwt',
  PAYME = 'payme',
  DATABASE = 'database',
  R2 = 'r2',
  SMS = 'sms',
}
