# NestJS MSA

NestJS를 이용하여 MSA(Micro Service Architecture)를 구성해보려한다.  
현업에서 구성할때는 당연히 수많은 기능들이 들어가겠지만 예약 시스템을 구성하기 위한 인증(Authentication), 결제(Payment), 알림(Notification) 3개의 기능을 중점으로 진행 할 예정이다.

Pacakge manager로는 pnpm을 사용할 것이고, 이후 Docker, Kubernetes를 이용하여 Google Cloud에 배포까지 진행해보겠다.

## Project Set-Up

일단 NestJS CLI를 사용하기 위해 `npm i -g @nestjs/cli`를 진행하여 설치한다.  
CLI를 설치했으면 먼저 `nest new <project name>`을 진행하여 최초 project를 생성한다.

## Library common

Common library에서는 모든 모듈에서 공통적으로 사용할 기능을 구성할 계획이다.  
먼저 `nest generate library common` 명령어를 통해 library를 생성한다.
이후 common library 구성을 위해 필요한 package인 `@nestjs/mongoose`, `mongoose`, `@nestjs/config`, `Joi`를 설치한다.(`pnpm i @nestjs/mongoose mongoose @nestjs/config Joi`)

우선 Common library에 database, config와 관련된 것들을 구성하려고 한다.(이후 다양한 것들이 추가될 예정임)  
일단 `nest generate module database -p common`를 이용하여 database module을 생성하고, `nest generate module config -p common`를 이용하여 config module도 생성한다.

- Config module

  Config module에서는 프로젝트에 필요한 기본적인 설정을 구성해주었다.

  ```typescript
  import { Module } from '@nestjs/common';
  import {
    ConfigService,
    ConfigModule as NestConfigModule,
  } from '@nestjs/config';
  import * as Joi from 'joi';

  @Module({
    imports: [
      NestConfigModule.forRoot({
        validationSchema: Joi.object({
          MONGODB_URI: Joi.string().required(),
        }),
      }),
    ],
    providers: [ConfigService],
    exports: [ConfigService],
  })
  export class ConfigModule {}
  ```

  위 코드를 설명하자면 아래와 같다.

  1. `@nestjs/config`에서 `ConfigModule`과 `ConfigService`를 가져옴(`ConfigModule`은 NestJS에서 기본으로 제공해주는 ConfigModule과 이름이 겹쳐 `NestConfigModule로` 새로 명명해줌)
  2. providers와 exports 옵션에 `ConfigService`를 넣어줌
  3. `NestConfigModule`의 `forRoot` 함수를 이용하여 `.env`의 유효성 검사를 `Joi`를 이용하여 진행한다.(현재 위 코드는 `.env`에 MONGODB_URI가 필수적으로 들어있어야함을 알려줌)

- Database module

  Database module에서는 mongodb 사용을 위한 기본적인 셋팅을 진행해주었다.

  ```typescript
  import { Module } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import { MongooseModule } from '@nestjs/mongoose';
  import { ConfigModule } from '../config/config.module';

  @Module({
    imports: [
      MongooseModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          uri: configService.get('MONGODB_URI'),
        }),
        inject: [ConfigService],
      }),
    ],
  })
  export class DatabaseModule {}
  ```

  위 코드를 설명하자면 아래와 같다.

  1. `@nestjs/mongoose`에서 `MongooseModule`을 가져와 `DatabaseModule`에 import 해줌
  2. `MongooseModule`은 `.env`를 load 후 실행되어야 함으로 `forRootAsync` 함수를 이용함
  3. 앞서 구성한 `ConfigModule`을 import해줌
  4. inject 옵션에 `ConfigService`를 넣어주어 의존성을 주입해줌
  5. useFactory 옵션을 이용하여 의존성 주입받은 `configService`에서 MONGODB_URI를 가져와서 uri값으로 전달해줌
