import { Inject, Injectable } from '@nestjs/common';
import { Reward, User } from 'src/graphql';
import { writeToJSON, getJSON, findDayOfWeek } from '../utils';
@Injectable()
export class UsersService {
  dbSource: string;
  constructor(@Inject('DB_SOURCE') dbSource: string) {
    this.dbSource = dbSource;
  }
  async findOrCreateById(id: number): Promise<User> {
    const userDB = await this.getDB();
    if (!userDB.users[id]) {
      userDB.users[id] = { id };
      await this.writeToDB(userDB);
    }

    return userDB.users[id];
  }

  async findRewardsByDate(id: number, weekOf: string): Promise<Reward[]> {
    const sundayOf = findDayOfWeek(weekOf, 0).toISOString();

    const userDB = await this.getDB();
    if (!userDB.users[id][sundayOf]) {
      userDB.users[id][sundayOf] = {
        rewards: this.createRewards(sundayOf),
      };
      await this.writeToDB(userDB);
    }
    return userDB.users[id][sundayOf].rewards;
  }

  async redeemReward(id: number, availableAt: string): Promise<Reward> {
    const sundayOf = findDayOfWeek(availableAt, 0).toISOString();
    const userDB = await this.getDB();

    if (!userDB.users[id]) {
      throw new Error(
        `User with id ${id} does not exist (try generating them with a user query!)`,
      );
    }

    const redeemedAt = new Date();
    const dayDiff =
      new Date(availableAt).getUTCDay() - new Date(sundayOf).getUTCDay();

    if (!userDB.users[id][sundayOf] || !userDB.users[id][sundayOf].rewards) {
      throw new Error(
        'Sorry! There are no rewards for the week of ' + availableAt,
      );
    }
    if (!!userDB.users[id][sundayOf].rewards[dayDiff].redeemedAt) {
      throw new Error(`Sorry! This reward has already been redeemed`);
    }

    const expiresAt = new Date(
      userDB.users[id][sundayOf].rewards[dayDiff].expiresAt,
    );

    console.log(
      `comparing ${redeemedAt.toISOString()} and ${expiresAt.toISOString()}`,
    );

    if (redeemedAt.getUTCDate() < expiresAt.getUTCDate()) {
      userDB.users[id][sundayOf].rewards[dayDiff].redeemedAt =
        redeemedAt.toISOString();
      await this.writeToDB(userDB);
    } else {
      throw new Error('Super Sorry! This reward has already expired');
    }
    return userDB.users[id][sundayOf].rewards[dayDiff];
  }

  private createRewards(weekOf: string): Reward[] {
    const date = new Date(weekOf);
    const rewards = [];
    for (let i = 0; i <= 6; i++) {
      const availableAt = date.toISOString();
      date.setDate(date.getDate() + 1);
      const expiresAt = date.toISOString();
      rewards.push({
        availableAt,
        redeemedAt: null,
        expiresAt,
      });
    }

    return rewards;
  }

  private async writeToDB(newDB) {
    return writeToJSON(newDB, this.dbSource);
  }
  private async getDB() {
    return getJSON(this.dbSource);
  }
}
