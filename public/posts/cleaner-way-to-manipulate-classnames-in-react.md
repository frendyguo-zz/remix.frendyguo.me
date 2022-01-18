---
title: Cleaner Way to Manipulate classNames in React
date: '2020-03-30'
shortDesc: How you can bring order to your React component
---

A [React](https://reactjs.org/) component can have **any** number of properties in its `state` and `props`, it re-renders whenever any one property changes.

Just like any other web element, React component also relies on CSS to define its interface. There are countless ways to style your React component. In this article, I'd like to share a little trick about classNames manipulation in React.

### What This Article is Not About
- Comparing CSS standards (BEM, OOCSS, SMACSS, SUITCSS, etc)
- Igniting some kind of framework wars
- Comparing all possible CSS solutions out there
- Selling module/library made by myself

### Get Started
OK, Enough talking, let's code, shall we? Suppose for some reason, we want to create a button. At first, it was simple. It does one thing, it has one look.

```jsx
  import React from 'react';

  const MyButton = () => {
    return (
      <button>My Button</button>
    );
  };
```

Neat right? However, two weeks later, the designer decided to tweak it a little bit, how about a few variations of color depending on the context?

Let's use [Bootstrap](https://getbootstrap.com/) button as the example, In Bootstrap, we can control a button's look and feel by changing its `type`.

Our button has a default type of  `normal`, but it can also convey the state `success`, `danger` and `warning`.

```jsx
  const MyButton = ({
    type,
  }) => {
    return (
      <button className="btn">My Button</button>
    );
  };
```

Now we have the `type` props, how do we use it to style our button?

#### Approach #1: Inline Styling
```jsx
  const MyButton = ({
    type,
  }) => {
    // For the obvious reason, we can't directly apply the `type` props to the backgroundColor.
    // But we still need to map the type to the right color.
    const generateBackgroundColor = () => {
      switch (type) {
        case 'success': return 'green';
        case 'warning': return 'yellow';
        case 'danger': return 'red';
        case 'normal':
        default:
          return 'blue';
      }
    };

    return (
      <button
        style={{
          backgroundColor: generateBackgroundColor(),
        }}
      >
        My Button
      </button>
    );
  };
```

While this approach might seem to work at first, we're starting to see some potential problems.

First of all, our React component now knows too much about the styling context. It currently holds CSS attribute values. It's bad because it has no separation of concerns, why are we throwing everything into one `jsx` file.

Secondly, it's not **scalable**. As you can see, the example I provide above is far from complete. What about the other styling attributes? Font color? Highlight color? Border? Outline? It can get out of control pretty soon.

#### Approach #2: CSS Modules
```css
  /* button.css */
  .btn,
  .btn--normal {
    background-color: blue;
  }

  .btn--warning {
    background-color: yellow;
  }

  .btn--danger {
    background-color: red;
  }

  .btn--success {
    background-color: green;
  }
```

```jsx
  import styles from './button.css';

  const MyButton = ({
    type,
  }) => {
    const generateStyles = () => {
      switch (type) {
        case 'success': return styles['btnSuccess'];
        case 'warning': return styles['btnWarning'];
        case 'danger': return styles['btnDanger'];
        case 'normal':
        default: return styles['btnNormal'];
      }
    };

    return (
      <button
        className={`btn ${generateStyles()}`}
      >
        My Button
      </button>
    );
  };
```

The second approach is much better now; we separate the CSS context from the component.

To answer if this approach is scalable, let's make our button more interesting by adding two more props; `size` and `disabled`. Oh, also, we might need to add an `active` state to indicate whether our button is currently, well... active.

You can learn more about CSS Modules [here](https://github.com/css-modules/css-modules).

```css
  /* button.css */
  .btn,
  .btn--normal {
    background-color: blue;
  }

  .btn--warning {
    background-color: yellow;
  }

  .btn--danger {
    background-color: red;
  }

  .btn--success {
    background-color: green;
  }

  .btn--small {
    width: 100px;
  }

  .btn--medium {
    width: 200px;
  }

  .btn--large {
    width: 300px;
  }

  .btn--disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .btn--active,
  .btn--active:active {
    outline: #222222;
  }
```

```jsx
  import styles from './button.css';

  const MyButton = ({
    type, // `normal`, `success`, `warning`, `danger`
    size, // `sm`, `md`, `lg`
    disabled, // true or false
    active, // true or false
  }) => {
    // 1. Update the function name
    const generateTypeStyles = () => {
      switch (type) {
        case 'success': return styles['btnSuccess'];
        case 'warning': return styles['btnWarning'];
        case 'danger': return styles['btnDanger'];
        case 'normal':
        default: return styles['btnNormal'];
      }
    };

    // 2. Add size styles
    const generateSizeStyles = () => {
      switch (size) {
        case 'sm': return styles['btnSmall'];
        case 'lg': return styles['btnLarge'];
        case 'md':
        default: return styles['btnMedium'];
      }
    };

    // 3. Add disabled style
    const disabledStyle = disabled ? styles['btnDisabled'] : '';
    // 4. Add active style
    const activeStyle = active ? styles['btnActive'] : '';

    return (
      <button
        className={`btn ${generateTypeStyles()} ${generateSizeStyles()} ${disabledStyle} ${activeStyle}`}
      >
        My Button
      </button>
    );
  };
```

Do you start to see the problem here? Sooner or later, our seemingly simple button turns into an uncontrollable mess.

#### Approach 3: classnames ✅
Let me introduce [classnames](https://github.com/JedWatson/classnames) by JedWatson.
`classnames` is a simple JavaScript utility for conditionally joining classNames together. At least that's how the author describes it in his github page.

`classnames` provides more intuitive way to manipulate our constantly growing classes. Take a look at the example below

```jsx
  import cls from 'classnames';

  const MyButton = ({
    type, // `normal`, `success`, `warning`, `danger`
    size, // `sm`, `md`, `lg`
    disabled, // true or false
    active, // true or false
  }) => {
    // 1. List our possible classes
    const baseClasses = {
      btnNormal: 'button--normal',
      btnSuccess: 'button--success',
      btnWarning: 'button--warning',
      btnDanger: 'button--danger',
      btnSmall: 'button--small',
      btnMedium: 'button--medium',
      btnLarge: 'button--large',
      btnDisabled: 'button--disabled',
      btnActive: 'button--active',
    };

    // 2. Conditionally apply class
    const propsClass = {
      [baseClasses.btnNormal]: type === 'normal',
      [baseClasses.btnSuccess]: type === 'success',
      [baseClasses.btnWarning]: type === 'warning',
      [baseClasses.btnDanger]: type === 'danger',
      [baseClasses.btnSmall]: size === 'sm',
      [baseClasses.btnMedium]: size === 'md',
      [baseClasses.btnLarge]: size === 'lg',
      [baseClasses.btnDisabled]: disabled,
      [baseClasses.btnActive]: active,
    };

    // 3. Attach to our button class
    return (
      <button
        className={cls('btn', propsClass)}
      >
        My Button
      </button>
    );
  };
```

There you go, our code is now cleaner and more predictable. Let's go through what we just wrote
1.  We group together all the possible classNames
2.  Create an object to decide which class should be applied
3.  Attach the final result to our button with a little help from `classnames`

Better yet, we can combine this approach with **CSS Modules**

```jsx
  import cls from 'classnames';
  import styles from './button.css';

  const MyButton = ({
    type, // `normal`, `success`, `warning`, `danger`
    size, // `sm`, `md`, `lg`
    disabled, // true or false
    active, // true or false
  }) => {
    // 1. Conditionally apply our css modules classes
    const propsClass = {
      [styles.btnNormal]: type === 'normal',
      [styles.btnSuccess]: type === 'success',
      [styles.btnWarning]: type === 'warning',
      [styles.btnDanger]: type === 'danger',
      [styles.btnSmall]: size === 'sm',
      [styles.btnMedium]: size === 'md',
      [styles.btnLarge]: size === 'lg',
      [styles.btnDisabled]: disabled,
      [styles.btnActive]: active,
    };

    // 2. Attach to our button class
    return (
      <button
        className={cls(styles.btn, propsClass)}
      >
        My Button
      </button>
    );
  };
```

## Conclusion

There are other solutions we don't cover here, such as [styled-components](https://styled-components.com/), [CSS-in-JS](https://cssinjs.org/), [Aphrodite](https://github.com/Khan/aphrodite), [Radium](https://formidable.com/open-source/radium/) and so and so. Each of these solutions has its own pros and cons. Whatever you choose is entirely depends on your codebase and preference.

That said, nothing is stopping you from combining several methods altogether. You can use plain CSS in one component, and SASS combined with CSS Modules in the other.

How do you write CSS in React? What's your preferred solution? Let's discuss 🙌.
