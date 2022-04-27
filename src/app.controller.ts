import { Controller, Get, Redirect } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/')
  @Redirect('localhost:3000/graphql', 200)
  async toGraphQL() {
    console.log(
      'Not doing anything here, so well just head to the graphql playground',
    );
  }
}
