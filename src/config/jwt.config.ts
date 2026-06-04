import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

interface EnvConfig {
  JWT_SECRET: string;
}

export function getJwtConfig(
  configService: ConfigService<EnvConfig, true>,
): JwtModuleOptions {
  return {
    secret: configService.getOrThrow('JWT_SECRET'),
    signOptions: {
      algorithm: 'HS256',
    },
    verifyOptions: {
      algorithms: ['HS256'],
    },
  };
}
