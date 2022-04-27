import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { writeToJSON } from '../src/utils';
import * as mockUsersSnapshot from './mocks/users.json';
import { Reward } from 'src/graphql';

describe('UserService (e2e)', () => {
  let app: INestApplication;
  let httpServer;
  const gql = '/graphql';
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('DB_SOURCE')
      .useValue('test/mocks/users.json') //this points our tests to a mocked db
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer();
  });

  describe('GraphQL Tests', () => {
    describe('user', () => {
      it('should return a user object with just an id given only an id field', () => {
        return request(httpServer)
          .post(gql)
          .send({
            query: `query{user(userInput: {id: 1}) {id}}`,
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.user).toEqual({ id: 1 });
          });
      });
      it('should return a user object with an id and rewards for week of given date', () => {
        const today = new Date().toISOString();
        return request(httpServer)
          .post(gql)
          .send({
            query: `query{user(userInput: {id: 1}) {id
              rewards(weekOf: \"${today}\") {
                availableAt
                redeemedAt
                expiresAt
              }
            }}`,
          })
          .expect(200)
          .expect((res) => {
            testRewards(res.body.data.user.rewards);
          });
      });
    });

    describe.only('redeemReward', () => {
      beforeEach(() => {
        jest.useFakeTimers('modern');
        jest.setSystemTime(new Date('2020-03-18T00:00:00Z'));
      });
      afterEach(async () => {
        await writeToJSON(mockUsersSnapshot, 'test/mocks/users.json');
        jest.useRealTimers();
      });
      it('should redeem a reward and return the time it was redeemed', () => {
        const today = new Date().toISOString();
        return request(httpServer)
          .post(gql)
          .send({
            query: `mutation {
                      redeemReward(redeemInput: {id: 0, availableAt: \"${today}\"}) {
                          redeemedAt
                      }
                    }`,
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.redeemReward);
            expect(res.body.data.redeemReward.redeemedAt).toEqual(today);
          });
      });
      it('should throw an error if reward has already expired', () => {
        const today = new Date().toISOString();
        const expiredTime = new Date();
        expiredTime.setDate(expiredTime.getUTCDate() + 1);
        jest.setSystemTime(expiredTime);
        return request(httpServer)
          .post(gql)
          .send({
            query: `mutation {
                      redeemReward(redeemInput: {id: 0, availableAt: \"${today}\"}) {
                          redeemedAt
                      }
                    }`,
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.errors);
            expect(res.body.errors[0].message).toEqual(
              'Super Sorry! This reward has already expired',
            );
          });
      });
    });
    const testRewards = (rewards: Reward[]) => {
      expect(rewards);
      expect(rewards.length).toBe(7);
      const date = new Date(rewards[0].availableAt);
      expect(date.getUTCHours()).toEqual(0);
      rewards.map((reward: Reward) => {
        const availableAt = new Date(reward.availableAt).getDate();
        expect(date.getDate()).toEqual(availableAt);
        date.setDate(date.getDate() + 1);
        expect(date.toISOString()).toEqual(reward.expiresAt);
      });
    };
  });
});
