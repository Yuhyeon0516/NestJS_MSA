# NestJS MSA

NestJS를 이용하여 MSA(Micro Service Architecture)를 구성해보려한다.  
현업에서 구성할때는 당연히 수많은 기능들이 들어가겠지만 예약 시스템을 구성하기 위한 인증(Authentication), 결제(Payment), 알림(Notification) 3개의 기능을 중점으로 진행 할 예정이다.

Pacakge manager로는 pnpm을 사용할 것이고, 이후 Docker, Kubernetes를 이용하여 Google Cloud에 배포까지 진행해보겠다.

## Project Set-Up

일단 NestJS CLI를 사용하기 위해 `npm i -g @nestjs/cli`를 진행하여 설치한다.  
CLI를 설치했으면 먼저 `nest new \<project name>`을 진행하여 최초 project를 생성한다.  
이후 `nest generate library common` 명령어를 통해 모든 기능에 공통적으로 사용할 library를 셋팅한다.
