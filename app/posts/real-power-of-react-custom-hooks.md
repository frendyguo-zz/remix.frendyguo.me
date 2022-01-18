---
title: 'The Real Power of React Custom Hooks'
date: '2021-02-18'
featuredImage: '/why_custom_hooks/hook.jpg'
shortDesc: And why you should be using them.
---

Before [React Hooks](https://reactjs.org/docs/hooks-intro.html), non class-based components were often called **stateless functional components**, or **dumb components**. Such components wouldn't have access to state nor do they have any lifecycle hook. As a result, the stateless functional component relies on its props as the only input.

For the mere purpose of presentation, the stateless functional component is almost always preferred over a class-based component due to its simpler syntaxes.

However, modern application is not all about presentation. Often, we need our application to remember stuff or perform a specific task when it reaches a certain lifecycle. Stateless functional components can do neither, the answer has to be a **class component**.

As a smarter counterpart, the class component has a built-in state object that you can access via `this.state`. It also provides a number of callbacks to several points of its lifecycles such as `componentDidMount`, `componentWillUnmount`, `componentWillReceiveProps`, and many more. Consequently, for anything beyond presentational, **there is no alternative to class component**.

The problem is, **class components are hard to use**. People can understand how states, props, and data flows work perfectly but still struggle to understand class. Due to these reasons, [React team felt that there has to be a better solution](https://github.com/reactjs/rfcs/blob/master/text/0068-react-hooks.md)--and the rest is history.

## What Are React Hooks Anyway?
A React Hooks is a function with a specific logic that you can hook into a stateless functional component. Hooks provide a powerful and expressive way to reuse logic across multiple components (more on this later). Something that wasn't possible with class components without complex restructures.

There are two types of Hooks in React.

### State Hooks
![React State Hooks](/why_custom_hooks/state_hook.jpg 'React State Hooks')

A **State Hook** provides a getter and setter that associates to a single value in a component. The state provided by a State Hook can be of any type, be it object, array, string, number, null, or whatever you want.

Just like state in a class component, changes in a state value causes the component to perform a re-render. For a smaller component with simpler states, `useState` is the perfect solution.

```jsx
import { useState } from 'react';

const KeywordRenderer = () => {
  const [keyword, setKeyword] = useState('Hello World!');

  return (
    <div className="my-keyword">{keyword}</div> // Hello World!
  );
};
```

However, `useState` falls short when it comes to complex state logic that involves multiple values and sub-values. As an alternative, you can use `useReducer` to solve that.

### Effect Hooks
![React Effect Hooks](/why_custom_hooks/effect_hook.jpg 'React Effect Hooks')

Side-effect (or just "effect") refers to a programming paradigm in which a function affects something outside its local scope. A function with side-effect makes it non-deterministic—that is the result of a function may differ every time it is called.

An **Effect Hook** lets you perform said side-effect. Side-effects could take many forms: data-fetching, subscription, or manually changing DOM in React component.

For example, with `useEffect` you can tell React to invokes an effect after the initial render. `useEffect` basically **tells React to do something after a render**. This Hook although not the same, can be thought of as the alternative to class component lifecycle callbacks such as `componentDidMount`, `componentWillReceiveProps`, etc.

One of the common use cases for this Hook is to fetch data after the initial render.

```jsx
import { useEffect, useState } from 'react';

const MyList = ({ id }) => {
  const [list, setList] = useState([]);

  // After initial render, setup a timer that updates state every second.
  useEffect(() => {
    fetch(`https://api.someurl/${id}`).then(resp => {
      setList(resp);
    });
  }, [id]);

  return (
    // Render `list`
	);
};
```

The example above is considered a component with side-effect because it depends on external data-source. there's no guarantee that the component always renders the same output.

## Why Is Custom Hook Necessary?
Imagine for a moment, you write a React component that displays and updates value from local storage. The value would persist even after a page refresh. How would you go writing it?

A component of this kind would require a state to store the value, an effect to retrieve from local storage, and a handler to set updated value.

```jsx
import { useEffect, useState } from 'react';

const key = 'my-key';

const PersistentRenderer = () => {
  const [val, setVal] = useState(0);

  useEffect(() => {
    const localValue = window.localstorage.getItem(JSON.parse(key));
    setVal(localValue);
  }, []);

  const handleUpdateValue = () => {
    window.localStorage.setItem(key, JSON.stringify(val + 1));
    setVal(val + 1);
  };

  return (
    <div>
      Value: {val} 
      <button onClick={handleUpdateValue}>Tick</button>
    </div>
  );
};
```

The solution is straightforward. You happily implement the details. But you realize the same functionality is needed elsewhere. So you do what you've always done, **copy and paste** the solution, perhaps with slight modification, and call it a day.

Now, what if the same functionality is needed in three more places?

To solve this, React allows you to write **custom Hooks** that extract specific business logic into a reusable piece.

Let's see how it works.

```jsx
// .../hooks/useLocalStorage.js

import { useState, useEffect } from 'react';

// Custom key and initial value
const useLocalStorage = (key, initialValue) => {
  const readValue = () => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (e) {
      console.warn('Error!', e);
      return initialValue;
    }
  };

  // Here, we store the value from previous function to the state hook
  const [storedValue, setStoredValue] = useState(readValue());

  const setValue = (newValue) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(newValue));
      setStoredValue(newValue);

      // Notify, so useLocalStorage hooks everywhere are notified
      window.dispatchEvent(new Event('local-storage'));
    } catch (e) {
      console.warn('Error!', e);
    }
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    }

    // Listen to storage change, update the state accordingly
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('local-storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('local-storage', handleStorageChange)
    }
  }, [])

  // Output the getter and setter
  return [storedValue, setValue];
};
```

Use the custom Hook.

```jsx
import useLocalStorage from '../hooks/useLocalStorage';

const key = 'my-key';

const PersistentRenderer = () => {
  const [localValue, setLocalValue] = useLocalStorage(key, 0);

  return (
    <div>
      Value: {localValue} 
      <button onClick={() => setLocalValue(localValue + 1)}>Tick</button>
    </div>
  );
};
```

Now that we move the cumbersome business logic to a custom Hook, any component that relies on the same functionality can benefit from it without us having to rewrite it.

## What Makes Custom Hooks Powerful?
The built-in React Hooks can be thought of as basic building blocks that you can combine to create a custom Hook that covers a wide range of use cases. This is possible because of two reasons.
### Custom Hook Is Just Another Function
You can do anything you want with it: to store some values, to perform an HTTP request, to translate a piece of text—you name it. As a function, it doesn't specify any signature. **You decide what it takes as an argument and what it should return**.
### Custom Hook Is Stateful
Similar to its component counterpart, a custom Hooks **may have one or more states and side-effects**. When a custom Hook is attached to a component, React treats it as if the logic was performed by the component itself.

Furthermore, each custom Hook gets its own isolated state. When two components access the same custom Hook, **they don't share the state**. Instead, they will both get a completely independent state.

To showcase the statefulness and isolated characteristic of a custom Hook, let's revisit the previous `useLocalStorage` Hook example.

Suppose we want to pull data from multiple local storage fields.

```jsx
import useLocalStorage from '../hooks/useLocalStorage';

const firstKey = 'my-first-key';
const secondKey = 'my-second-key';

const PersistentRenderer = () => {
  const [firstVal, setFirstVal] = useLocalStorage(firstKey, 0);
  const [secondVal, setSecondVal] = useLocalStorage(secondKey, 0);

  return (
    <>
      <div>
        First Value: {firstVal} 
        <button onClick={() => setFirstVal(firstVal + 1)}>Tick First</button>
      </div>
      <div>
        Second Value: {secondVal} 
        <button onClick={() => setSecondVal(secondVal + 1)}>Tick Second</button>
      </div>
    </>
  );
};
```

We would simply call another `useLocalStorage` with slight modification. Both custom Hooks never share the state because they are completely isolated.

## Conclusion
I'm willing to bet you've encountered or perhaps contribute to a **wrapper hell** yourself. A wrapper hell happens when you surround a component with layers of **provider**, **consumer**, **higher-order component**, **render props**, **localization**, and other abstraction layers. All these layers not only chip away performances, but they also make it much harder to understand let alone extend functionality on top of it.

Fortunately, with the addition of React Hooks, the wrapper hell can now be easily avoided. There are, however, some rules we need to keep in mind when making use of React Hooks API.

- **Only call Hooks either from React function component or custom Hooks**.
- **Only call Hooks at the top level of your component**.

Finally, React Hooks are flexible and highly customizable to suit your needs. You can write custom Hooks that abstract away the complexity and reuse them between components.

### Bonus
Here is a non-exhaustive **list of popular custom Hooks libraries** that can make your life easier.

[useMedia](https://github.com/streamich/use-media) → Tracks the state of CSS media query.

[React Router Hooks](https://reactrouter.com/web/api/Hooks) → If you use React Router, Access the state of the router and perform navigation from inside the components.

[useClippy](https://github.com/CharlesStover/use-clippy) → Performs a "copy to clipboard".

[useDocumentTitle](https://github.com/rehooks/document-title) → Change the title of your document.

[useDebounceCallback](https://github.com/xnimorz/use-debounce) & [useThrottleFn](https://github.com/streamich/react-use/blob/master/docs/useThrottle.md) → Controls the rate at which the function is called.

[useTranslation](https://react.i18next.com/latest/usetranslation-hook) → Translate your document

[useDarkMode](https://github.com/donavon/use-dark-mode) → Enables and disables the dark mode

[useQueryParam](https://github.com/pbeshai/use-query-params) → Encode and decode data of any type as a query parameter

[useLocalStorage](https://usehooks.com/useLocalStorage/) → Persistent state for your React component
