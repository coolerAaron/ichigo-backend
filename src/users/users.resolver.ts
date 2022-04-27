import {
  Resolver,
  Query,
  Args,
  ResolveField,
  Parent,
  Mutation,
} from '@nestjs/graphql';
import '../graphql';
import { RedeemInput, Reward, User, UserRequest } from '../graphql';
import { UsersService } from './users.service';
@Resolver('User')
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}
  @Query('user')
  async getUser(@Args('userInput') { id }: UserRequest): Promise<User> {
    return this.usersService.findOrCreateById(id);
  }

  @Mutation('redeemReward')
  async redeemReward(
    @Args('redeemInput') { id, availableAt }: RedeemInput,
  ): Promise<Reward> {
    return this.usersService.redeemReward(id, availableAt);
  }

  @ResolveField('rewards')
  async getRewards(
    @Parent() user: User,
    @Args('weekOf') weekOf: string,
  ): Promise<Reward[]> {
    return this.usersService.findRewardsByDate(user.id, weekOf);
  }
}
