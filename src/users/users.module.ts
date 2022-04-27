import { UsersResolver } from './users.resolver';
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
@Module({
  imports: [],
  providers: [
    //this injects a string literal into the UsersService as a constructor parameter
    { provide: 'DB_SOURCE', useValue: 'src/users/data/users.json' },
    UsersService,
    UsersResolver,
  ],
})
export class UsersModule {}
