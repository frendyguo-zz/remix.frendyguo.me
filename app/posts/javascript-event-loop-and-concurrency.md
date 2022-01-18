---
title: Javascript Event Loop and Concurrency
date: '2020-11-23'
featuredImage: '/event_loop/loops.jpg'
shortDesc: Understanding Event Loop, Javascripts' underlying concurrency model.
---

Ever think about how Javascript handles incoming tasks such as function calls or event processing?

In this article, we'll talk about Javascript's event loop, related concepts such as call stacks, callback queue and why they matter.

## Understanding Event Loop
![Event Loop](/event_loop/event-loop.png)

In Javascript, the event loop is a constantly running process that waits synchronously for messages to arrive (if one is not already available and waiting to be handled).

```js
  while (queue.waitForMessage()) {
    queue.processNextMessage()
  }
```

Each incoming messages are then pushed into **call stacks**. You might already heard that Javascript is single-threaded, but what does it mean?

Javascript can only do one thing at a time, because it has only one call stack.

### Call Stack
A call stack is a mechanism for Javascript interpreter to keep track and manage the executions.

Everytime a script calls a function, it's added to the top of the stack (because call stack operates by the principle of Last In, First Out). Everytime the function exits, it is removed from the call stack and moves on to the next function until it is empty.

Take a look at the example below
```js
function thirdFn() {
  console.log('Called from thirdFn()');
}

function secondFn() {
  thirdFn();
  console.log('Called from secondFn()');
}

function firstFn() {
  secondFn();
  console.log('Called from firstFn()');
}

firstFn();

// Called from thirdFn()
// Called from secondFn()
// Called from firstFn()
```
When we run this piece of code, the `firstFn()` function will be pushed onto the call stack. And since it is at the top of the stack, it will be executed.

The very first line of `firstFn()` calls `secondFn()` thus pushing the `secondFn()` to the top of the stack. The `secondFn()` then refers to another function `thirdFn()` and the process is repeated one more time.

Once the stack is empty, the program will stop running.

### A Single-Threaded World
![Single Threading](/event_loop/long-thread.jpg)

A downside of this model is that if a function takes too long to complete, no new execution contexts can happen until the function exits.

```js
function secondFn() {
  console.log('Called from secondFn()');
}

function firstFn() {
  console.log('Called from firstFn()');
  for (var i=0; i<1000000000; i++) {
    console.log(i);
  }
  secondFn();
}

firstFn();

// Called from firstFn()
// 1
// 2
// 3
// .
// .
// .
// .
// 1000000000
// Called from secondFn()
```
Take a look at the example above,

When we call the `firstFn()`, it will call a `console.log('Called from firstFn()')` and then wait for however long it takes to iterate through 1.000.000.000 numbers, and only then can `secondFn()` be executed.

In the context of web application, no user input such as scroll or click can work during the blocking phase. Imagine using a web application where it constantly blocks you from doing basically anything, it would pretty much making it unusable.

## Enter The Concurrency
While it is true that Javascript runtime can only do one thing at a time, but that's not the case with the browser. The browser itself has its own set of APIs like `setTimeout` and `XMLHttpRequests` which are not specified in the Javascript runtime.

Therefore concurrency is achievable through the utilization of WebAPIs provided by the browsers.

### Callback Queue
A callback queue, also referred as message queue is a waiting area for functions. Whenever the call stack is empty, the event loop will check the queue for any waiting messages. If it finds one, it will add it to the call stack, which will be executed.

Let's take a look at another example
```js
(function() {
  console.log('1st');
  console.log('2nd');
  setTimeout(function() {
    console.log('3rd');
  }, 0);
  setTimeout(function() {
    console.log('4rd');
  }, 0);
  console.log('5th');
})();

// 1st
// 2nd
// 5th
// 3rd
// 4th
```
In the code above, the execution begins by logging `1st` and `2nd`, when it reaches the third and fourth functions, it invokes `setTimeout` which is an API provided by the browser. This function accepts `callback` function as an argument which will be stored in a structure called **Callback Queue** for later execution. Finally, the fifth function will log `5th` as usual.

So, where were third and fourth functions? They're still remained inside the callback queue waiting for the event loop to pass them back to the call stack.

After the `5th` log, since there are nothing left inside the call stack, the event loop will move the third and fourth functions onto the call stack, begins the countdown (which is almost immediately, in 0 seconds) logging `3rd` and `4th` thus ending the process.

## Conclusion
With this, I hope you get a better understanding of how Javascript handle incoming tasks under the hood. There are other stuffs related to event loop that I didn't cover here like Heap, [microtasks and macrotasks](https://javascript.info/event-loop), [error stacks](https://yonatankra.com/the-event-loop-and-your-code/) and [NodeJs event loop](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/).


