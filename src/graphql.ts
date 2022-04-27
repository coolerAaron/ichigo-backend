
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export interface UserRequest {
    id: number;
}

export interface RedeemInput {
    id: number;
    availableAt: string;
}

export interface User {
    id: number;
    rewards: Reward[];
}

export interface Reward {
    availableAt: string;
    redeemedAt?: Nullable<string>;
    expiresAt: string;
}

export interface IQuery {
    user(userInput: UserRequest): Nullable<User> | Promise<Nullable<User>>;
}

export interface IMutation {
    redeemReward(redeemInput: RedeemInput): Nullable<Reward> | Promise<Nullable<Reward>>;
}

type Nullable<T> = T | null;
