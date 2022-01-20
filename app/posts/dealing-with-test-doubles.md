---
title: "Dealing With Test Doubles"
date: '2021-12-24'
featuredImage: '/test_doubles/stones.jpg'
shortDesc: "Learn the differences of various test doubles"
---

No doubt testing is one of the most important parts of software development. Many tools have been developed to make the process of testing easier. But often time engineers are reluctant to write test because of two reasons, **brittle and slow tests**.

Test is considered brittle if it fails due to unrelated change that does not introduce any bugs on production codes. This can happen if the test is validating implementation details rather than the public APIs.

On the other hand, slow test can be due to many reasons. Maybe the test is performing an HTTP request that adds up the latency, maybe the test has to simulate delays in order to satisfy certain conditions, and so and so. Few of these are fine, but imagine hundreds of test cases with each adding a few seconds to the runtime, the test will likely take hours to finish. 

In such cases, **test doubles** can be handy.

## Test Doubles
If the term test double feels rather strange to you, that's because we have been mostly using the word "mock" to refer to the whole family of objects that are used in test.

Just like how a stunt double stands in for an actor in order to perform physically demanding stuffs, test double is used as a substitute for the real implementation. A test double is simply a stand-in object or function that behaves similarly to that of a real implementation. It is an ideal choice when using the real production service is simply not feasible. 

Can you imagine the incurred cost of having to actually proceed with payment on credit-card payment service every time we run a test case?

There's a short blog post titled [The Little Mocker](https://blog.cleancoder.com/uncle-bob/2014/05/14/TheLittleMocker.html) written by Robert Martin (also known as Uncle Bob) that hilariously explains the relationship between various kinds of test double.

In short, test doubles are comprised of dummies, fakes, stubs, spies, and mocks. Each enables a different style of testing.

Out of these, Dummy objects have no real behavior, they're only passed around to fulfill parameter lists, while the rest work a bit differently. It is particularly helpful for engineers to understand how each technique work and what are the downsides of it.

### Fakes
First, we have fakes, a lightweight version of an API, object, or function. Fakes behave similarly to real objects, they have business behavior but usually take some shortcuts in order to simplify. 

An example of this would be an in-memory database that stands in for real database.

Fakes can be constructed without help from mocking frameworks such as [Jest](https://jestjs.io/) or [Sinon](https://sinonjs.org/). An example of a fake object in Typescript,

```ts
interface Payload {
  username: string;
  password: string;
}

interface Authentication {
  isAuthenticated: boolean;
  authenticate: (payload: Payload) => void;
}

class FakeAuthentication implements Authentication {
  isAuthenticated: boolean = false;

  authenticate(payload: Payload): void {
    if (payload.username === 'Bob' && payload.password === 'Ross') {
      this.isAuthenticated = true;
    }
  }
}

const fakeAuth = new FakeAuthentication();

const payload = {
  username: 'Bob',
  password: 'Ross'
};

it('test fakeAuth', () => {
  fakeAuth.authenticate(payload);
  expect(fakeAuth.isAuthenticated).toEqual(true);  // ✅
});
```

With fakes, real implementation can be replaced with a fake one. In the example above, we created a fake authentication class that closely follows the authentication API contract, this class can later be used as a replacement of real authentication as long as the interface matches.

A rather important concept surrounding the creation of test doubles is *fidelity*, that is how closely the behavior of a fake matches the behavior of the real implementation. The higher the fidelity, the better, that means the fakes resemble more closely to production codes and in turn, we can rely on them to catch bugs in the event of breakages.

However, one downside of fakes is that they can be difficult to create and burdensome to maintain.

### Stubs and Spies
Other techniques are stub and spy. By definition, stubbing is a process of adding behavior to a function that otherwise does not yet exist. Though, can also be used to replace an existing behavior in order to avoid having to deal with dependency.

Spies on the other hand are just stubs but they keep track of invocation such that you can verify how many times they're being called.

In Jest, stubs and spies are the same thing, they can be created with `jest.spyOn()`,

```ts
interface Counter {
  count: number;
  getCount: () => number;
  getCountText: () => string;
}

const myCounter: Counter = {
  count: 0,
  getCount: function () {
    return this.count;
  },
  getCountText: function() {
    const count = this.getCount();
    if (count > 10) {
      return 'More than 10';
    } else {
      return count.toString();
    }
  }
};

jest.spyOn(myCounter, 'getCount').mockReturnValue(20);
expect(myCounter.getCountText()).toEqual('More than 10');
```

In the example above, we stub a behavior on `getCount` method such that it will always return a value `20` no matter what.

Stubs are appropriate when there's a need to simulate a wide variety of return values that might not be possible should we use real implementation or fakes.

Additionally, since Jest treats stub and spy object as the same thing, that means we can verify that the object is indeed being invoked.

```ts
  expect(mockCounter.getCount).toHaveBeenCalled(); // ✅
```

Because stubbing is so easy to apply, it can be tempting to treat it as easy patch to otherwise non-trivial behaviors. Deviation from real implementation is a real concern if we excessively rely on stubs to customize implementations.

### Mocks
You might notice that up until now, what we're doing is simply validating if the "state" is correct given conditions. In other words, we're doing a state verification, a test that verifies whether the exercised method worked correctly by verifying the state of the system under test.

The thing is, the system under tests may or may not be stateful, in which case we need to employ behavior verification testing, a test that verifies invocation of a certain method. And this is where mocks came into play.

Mocks are pre-programmed objects with the ability to observe invocations. During test, the mocked object is used instead of the real object, this is a good way to ensure that side-effects do not happen. And more, we can set assertions such that the test should fail if a function isn't called at all, called with the wrong arguments, or called too many times.

Suppose we have an object called `analytics` that contains a number of methods that look like this,
```ts
// analytics.ts
const analytics = {
  sendEvent: function(eventName: string) {
    // send even to analytics dashboard;
  },
  sendButtonClickEvent: function() {
    this.sendEvent('button-click');
  },
  sendInitEvent: function() {
    this.sendEvent('init');
  }
};

export default analytics;
```

We probably don't want to send an actual event to the analytics dashboard during tests, but we do need to make sure that they're called.

To solve this, we can mock the `analytics` module,

```ts
jest.mock('./analytics');

test('test analytics module', () => {
  const analytics = require('./analytics').default;
  expect(analytics.sendEvent._isMockFunction).toEqual(true);   // ✅
  expect(analytics.sendButtonClickEvent._isMockFunction).toEqual(true);   // ✅
  expect(analytics.sendInitEvent._isMockFunction).toEqual(true);   // ✅
});
```

`jest.mock('./analytics')` in this case is an equivalent to

```ts
const analytics = {
  default: {
    sendEvent: jest.fn(),
    sendButtonClickEvent: jest.fn().
    sendInitEvent: jest.fn()
  }
}

export default analytics;
```

`jest.fn()` is a handy function that will erase the current behavior of a method and replace it with a mock object. With this, we can safely invoke `analytics.sendEvent()` for testing purposes and don't have to worry about side effects.

We can then perform a thorough assertions like this,

```ts
analytics.sendEvent('button-click');
analytics.sendEvent('init');

expect(analytics.sendEvent).toHaveBeenCalledTimes(2);   // ✅
expect(analytics.sendEvent).toHaveBeenCalledWith('button-click');   // ✅
expect(analytics.sendEvent).toHaveBeenCalledWith('init');   // ✅
```

One downside of this kind of testing is that it utilizes implementation details of the system under test. We are exposing to the test that the system under test calls this exact function.

[In this article](https://kentcdodds.com/blog/testing-implementation-details), Kent C. Dodds puts it well, testing implementation details are bad because of two reasons:

1. Test can break if we refactor application codes. **False negatives**
2. Test may not fail if we break application code. **False positive**

Both cases suggest that the test knows too much of the inner detail of the system under test.

## State Verification VS Behavior Verification
One thing that I asked myself a lot during test was that should I use a mock or a stub?

It turns out, the answer to this question depends on whether it's more appropriate to perform a state verification rather than behavior verification.

In the article [Mocks Aren't Stubs](https://martinfowler.com/articles/mocksArentStubs.html#TheDifferenceBetweenMocksAndStubs) by Martin Fowler, this decision almost always depends on context. Are we talking about easy collaboration or a rather awkward one?

If the collaboration is easy, for example between the `Order` class and `Warehouse` class, we are more likely to be able to use real objects or stubs and perform a state verification. If it's an awkward collaboration, such as collaboration between `Order` class and `MailService` class, we are likely to use mock and perform a behavior verification.

Another factor to consider is how close both of these methods of testing resembles the actual working codes. The primary issue with behavior verification is that we can't be sure that the system under test is working properly, we can only validate that certain function is called as expected. For example, if `database.save(payload)` function is called, we can only assume that the item will be saved to the database. While with state verification, we can actually perform a query to the database to verify that the item indeed exists.

Of course, in the end, we need to measure the tradeoffs between the two decisions.

## Conclusion
One thing I learned about software testing is that different testing frameworks have different takes on test doubles creation. In `jest`, test double creation is limited to `jest.mock()` and `jest.spyOn()`, stub and spy are treated as the same thing, and you can use mock and stub interchangeably. While in `sinon`, there are `sinon.stub()`, `sinon.fake()`, `sinon.mock()`, and `sinon.spy()`.

Test doubles are extremely valuable in helping engineers write comprehensive test suites that run fast. However, misusing them can result in a maintenance nightmare. That's why it's important for engineers to understand the ups and downs of each kind of test double. Oftentimes, engineers need to make trade-offs regarding which technique to use.
