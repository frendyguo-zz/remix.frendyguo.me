---
title: "Narrow Down Types With Typescript Generic Constraints"
date: '2022-01-08'
featuredImage: '/generic_constraints/generic_constraints.jpg'
shortDesc: "How to unleash the real power of Typescript generics"
---

Any statically-typed language supports *generic*, [Typescript](https://www.typescriptlang.org/) is no exception. With generic, we can write a flexible type signature that encourages reusability for our functions. Without it, functions are restricted to one specific data type which in turn, makes it hard to reuse.

```ts
function createArray(items: string[]) {
  return new Array().concat(items);
}
```

In the example above, the function `createArray` accepts an array of `string` and outputs an array of `string`. Depending on the use case, but we can *improve* this function by giving it a generic type such that it accepts more than just `string` type.

```ts
function createArray<T>(items: T[]) { ... }

createArray<string>(['Hitchhiker', 'Guide', 'To', 'The', 'Galaxy']); ✅
createArray<number>([42]); ✅
createArray(['Life', 42]) ✅ // `string | number`
```

With generic, we can enforce our `createArray` function to accept and return a specific type.

In addition, omitting the type will cause the `createArray` function to infer the type from the argument (`['Life', 43]` is translated into `string | number`). This looks great, our function can be reused with different type signatures.

However, a lot of times when writing a generic function, we might have some prior knowledge about how our function works underneath and therefore we can narrow down the type. In Typescript, this is called **Generic Constraint**.

## Understanding Generic Constraint
A [generic constraint](https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-constraints) is simply a way to put some constraints to a type. Suppose we have a generic function like this,
```ts
function getStuff<T>(arg: T) {}

getStuff("Hitchhiker's Guide to the Galaxy"); ✅
getStuff(42); ✅
getStuff([]); ✅
getStuff({}); ✅
getStuff(null); ✅
getStuff(undefined); ✅
```

You'll notice that `null` and `undefined` are allowed here, it might be what we wanted, but I'm sure most of the time these are invalid inputs. To solve this, we can put a constraint on our generic type to disallow empty value.

```ts
function getStuff<T extends {}>(arg: T) {}

getStuff("Hitchhiker's Guide to the Galaxy"); ✅
getStuff(42); ✅
getStuff({}); ✅
getStuff([]); ✅
getStuff(undefined); ❌
getStuff(null); ❌
```

In the example above, `T extends {}` means that `T` can be any type that is a subclass of `{}` (an object), in Javascript `string`, `number`, `array` and `object` are all subclasses of `object`, while `undefined` and `null` are not, therefore they are disallowed. This is what generic constraint syntax look like, by extending the `T` type.

### Generic Type With Specific Behavior
Somewhere in our function, we might invoke a specific method of the argument, but with generic, we can't be sure such property exists. Therefore we need to further constraint our function to only accept an argument with a specific signature.

```ts
type Lengthwise = {
  length: number;
};

function getLength<T extends Lengthwise>(arg: T): number {
  return arg.length();
}

getLength("Hitchhiker's Guide to the Galaxy"); ✅ // 6
getLength(42); ❌
getLength({}); ❌
getLength([]); ✅ // 0
getLength(undefined); ❌
getLength(null); ❌
```

In the example above, only `string` and `array` have property `.length` while the rest are disallowed.

### Get What You Ask For
Now that we've gained some ground, let's see how we can perform a more advanced constraining with Typescript. Suppose we want to create a function that accepts a custom shape and return the exact same shape like this, 

```ts
const {
  foo,
  bar
} = getStuff({
  foo: '',
  bar: ''
});
```

This is a perfect case for generic constraints. Let's start by defining our custom type.

```ts
type CustomObject = {
  foo: string;
  bar: string;
  baz: string;
};
```

Our custom type has three fields: `foo`, `bar`, and `baz`. The argument can be a full set or a subset of `CustomObject`, to solve this we can use the Typescript built-in type `Partial`.

```ts
function getStuff<T extends Partial<CustomType>>(arg: T): T { ... }

const {
  foo, // ✅ 
  bar, // ✅
  baz // ❌ `baz` does not exist on type `{ foo: string; bar: string; }`
} = getStuff({
  foo: '',
  bar: ''
});
```

Perfect! Our function returns exactly the shape we asked for, no more and no less. Note that the empty string `''` is simply a placeholder value to fulfill the object shape, it doesn't actually do anything (we can customize it though).

Alternatively, if you dislike the fact that we use an object to define the shape, we can also do it like this,

```ts
type StuffRequest = keyof CustomType;
type StuffResponse<T extends StuffRequest> = {
  [k in T]: CustomType[k];
}

function getStuff<T extends StuffRequest>(...args: T[]): StuffResponse<T> { ... }

const {
  foo,
  baz,
  bar // ❌ `bar` does not exist on type `StuffResponse<'foo' | 'baz'>`
} = getStuff('foo', 'baz');
```

Which one is better, you decide.