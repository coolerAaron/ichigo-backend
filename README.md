# Untitled

# Daily Rewards API

This is an api powered by graphql and nestJS that lets you poll a “database” (in this case, a literal json file) for users and redeem rewards for them.

# Usage

This is pretty barebones, but:

1. First we get the app started
    
    ```graphql
    npm run start
    ```
    
2. This serves it up on [http://localhost:3000](http://localhost:3000)...
3. ...but to actual use the api, you send graphql queries over to the `/graphql` endpoint
    1. I reccomend something like insomnia for that, but you also just navigate to the endpoint on your browser and use the graphql playground interface.

# GraphQL Schema

There are two main queries of note, a query (duh) for grabbing or generating users on the spot and a mutation for actually redeeming rewards, which involves writing to the rewards object on a given user.

`user`

```graphql
user(userInput: {id: $id}) {
		id
    rewards(weekOf: "2020-03-21T00:00:00Z"){
			redeemedAt
      availableAt
			expiresAt
    }
  }
```

This either grabs a user or creates one with the given id property. The `rewards` field here takes in a `weekOf` argument to grab right range of rewards for that user. You can easily make a custom query to pass in an arg to that resolver. Whats cool about graphql is that you only get back what you need, so if I were to just use the id field here, I’d get back just an id.

`redeemRewards`

```graphql
redeemReward(redeemInput: {id: $id, availableAt: $availableAt}) {
    redeemedAt
      availableAt
			expiresAt
  }
```

This takes in an id and an availableAt string and uses those to key into a json file in order to update the `redeemedAt` with the current time. This only happens if the current time is less than the `expiresAt` field of course (Otherwise, we throw an error). This will also throw an error if either a user does not exist, or the reward range for the `availableAt` param does not exist. 

# JSON “Database” Schema

So its setup pretty simply, though obviously not very efficient scale wise. There is file called in the `/users` folder called `users.json` thats setup like this by default:

```graphql
{
  "users": {
    "0": {
      "id": 0,
      "2020-03-15T00:00:00.000Z": {
        "rewards": [
          {
            "availableAt": "2020-03-15T00:00:00.000Z",
            "redeemedAt": null,
            "expiresAt": "2020-03-16T00:00:00.000Z"
          },
          ...
        ]
      }
    }
  }
}
```

Few things to note here:

- ids are treated as keys into a map of users
- we hold the rewards object in map keyed into with a date string corresponding to the sunday of a given week
    - This makes finding the right date range for a given date in our queries very simple
- all dates are ultimately handled in UTC time internally

# Design thoughts

So I thought this was a pretty fun exercise overall, lotta things that can be improved upon of course in both the design and my process. 

First of all I wanted to use GraphQL because, even though I’ve been using it professionally for about a year now, I think working on something from scratch and completely related to the domain models I’m used to is a good exercise. 

As for the framework, NestJS, I’ve been curious about it for a while, so I thought “Hey why not” and used it for this. At the end of the day, theres a lot of cool stuff that it provides out of the box, especially in terms of dependency injection and enforcing better design practices with the module/controller/service system. But for this it kinda felt like overkill considering how much it bootstrapped that I didn’t really need. All in all though, don’t regret working with it, learned quite a bit.

As for the actual flaws of this, i’m gonna just bullet some thoughts:

- Couldn’t really decide on whether to make a fake repository layer that would handle writing to the json, so I just made two little helper functions that do `fs` reads and writes.
    - those helper functions would definitely scale horribly since they’re rewriting the entire json file everytime, but if this were a real app, I’d actually be using a database, so I’m not to pressed about it.
- Would’ve liked actual unit tests at the service level, but I think having at least some rudimentary e2e tests scaffolded out ain’t bad.
    - Theres a lot I can learn in terms of test driven development, but I’m wondering now if starting with large, general test cases involving how you want your api to function can be prioritized before you get down into more nitty gritty unit tests.
- Date math is a nightmare
- Didn’t want to add on anymore deps, but when using a graphql schema for something like this, having a custom scalar type to handle `DateTime` is definitely useful.
