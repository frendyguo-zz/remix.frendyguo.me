---
title: 'Server Component: The React Way to Server-side Rendering'
date: '2021-02-07'
featuredImage: '/server_component/rsc.png'
shortDesc: Introducing the React Component that runs on server and achieve zero bundle size.
---

From the very existence of [React](https://reactjs.org/) in the web development world, React has always remained a frontend framework that heavily focuses on client capabilities. The latest React Hooks addition to the React ecosystem further indicates where the framework is heading.

Until recently, React team released [a sneak peek](https://reactjs.org/blog/2020/12/21/data-fetching-with-react-server-components.html) and opens an RFC around Server Component, dubbing it the Zero-Bundle-Size component. I highly recommend you read the [RFC](https://github.com/josephsavona/rfcs/blob/server-components/text/0000-server-components.md) or [watch Dan Abramov and Lauren Tan's talk](https://youtu.be/TQQPAU21ZUw).

This is a very interesting turn because the server-side of React has been quite underdeveloped for a while now and finally, it gets some attention as React team starts experimenting on components that work and optimized for the server.

## The Challenges

When it comes to server-side rendering, chances are you either set up your own server, write a bundler with custom behaviors that suit your own needs, or you depend on server-side React frameworks like [NextJs](https://nextjs.org/), [AfterJs](https://github.com/jaredpalmer/after.js/), [Gatsby](https://www.gatsbyjs.com/) that abstracts away the data-fetching layer, and other optimization works.

And it probably works fine when you just started. The first few pages of your application load blazingly fast, however as the codebase grows, so does the bundle size and the cost of maintenance. Several noticeable challenges including the network waterfall, unused extra codes, and abstraction cost.

### Network Waterfall

One of the common patterns for data fetching is to initially render a placeholder and then fetch data after the component has been mounted.

```jsx
function TodoList(props) {
  const [todos, setTodos] = useState(null);

  useEffect(() => {
    fetchTodos(props.id).then(todosData => {
      setTodos(todosData);
    });
  }, [props.id]);

  if (!todos) {
    return (
      {/* Loading Placeholder */}
    )
  }

  return (
    {/* Render Todo Items */}
  );
}
```

Network waterfall happens when both the parent and child component follow this approach because the child component's effect can't start until the parent finish the rendering, causing sequential round trips. With the server component, the round trips are moved to the server, providing ease of access to the data source and latency reduction.

Note that this approach doesn't eliminate the waterfall, but it does significantly diminish the consequences of multiple round trips.

### Unused Extra Codes

Practical advice for server-side rendered web application is to optimize for initial above-the-fold contents and only then add non-critical contents and extra Javascript codes for interactivity. But the truth is, it is the non-critical assets that add up to the large bundle size. So, naturally, it makes sense to defer or eliminate the non-critical assets altogether.

**Problem #1, The solution doesn't come by default**. React server-side frameworks such as NextJs or Gatsby does part of the job by automatically performing a route-based code splitting for you. It is a good default, but for deeper level improvement such as component level code-splitting, it requires developers to consciously specify which part to load lazily.
Server component solves this problem by treating all imports as a potential code-split point and also providing ways for developers to decide which part should be load on the server so that client can download it earlier.

```jsx
// PhotoRenderer.server.js - Server Component
import React from 'react';

// one of these will start loading *once rendered and streamed to the client*:
import OldPhotoRenderer from './OldPhotoRenderer.client.js';
import NewPhotoRenderer from './NewPhotoRenderer.client.js';

function Photo(props) {
  // Switch on feature flags, logged in/out, type of content, etc:
  if (FeatureFlags.useNewPhotoRenderer) {
    return <NewPhotoRenderer {...props} />;
  } else {
    return <OldPhotoRenderer {...props} />;
  }
}
```

**Problem #2, excessive bundle size on the non-interactive page content**. Upon developing an application, we tend to depend on third-party libraries in order to format a date or to render a markup, and it's probably easier that way since we don't want to reinvent any kind of wheel. But it adds up to the total bundle size.

```jsx
// NoteWithMarkdown.js
// NOTE: *before* Server Components

import marked from 'marked'; // 35.9K (11.2K gzipped)
import sanitizeHtml from 'sanitize-html'; // 206K (63.3K gzipped)

function NoteWithMarkdown({text}) {
  const html = sanitizeHtml(marked(text));
  return (/* render */);
}
```

More importantly, many parts of the application don't require interactivity. For example, a post detail page that consists mostly of texts and images is probably going to stay static throughout the whole lifecycle of the application and doesn't need updates in response to user interaction.

In this case, server component provides a way to render static content on the server as part of the initial load and omit away the extra bundle size that probably isn't needed by the client.

```jsx
// NoteWithMarkdown.server.js - Server Component === zero bundle size

import marked from 'marked'; // zero bundle size
import sanitizeHtml from 'sanitize-html'; // zero bundle size

function NoteWithMarkdown({text}) {
  const html = sanitizeHtml(marked(text));
  return (/* render */);
}
```

### Cost of Abstraction

As developers, we like abstraction because it helps us encapsulate complex behaviors, self-contain modules, and decouple software elements. Making applications extendable in much easier ways and benefits the whole ecosystem. In the context of React, it means having multiple layers of wrappers for configurability that ultimately tie together lower-level components to be part of the user interface. For example, a button could be part of the contact form which can be part of the contact page.

```jsx
// Example of Composition

import ContactForm from './ContactForm';
import Button from './Button';


function ContactPage() {
  return (
    <section>
      <ContactForm>
        {/* Stuffs.. */}
        <Button>Submit</Button>
      </ContactForm>
    </section>
  );
}

// Sent to client
<section>
  {/* contents */}
</section>
```

However, when overused these abstractions could result in more codes and runtime overhead. To address this issue, the server component only sends down the final results to the client, removing the abstraction cost on the server.

## How Is It Different From Server-Side Rendering?

SSR for client Javascript application is an illusion. It basically takes an application, renders it into HTML and CSS on the server, and sends it down to the client. It results in a faster initial load time for users, especially ones with a slower internet connection. However, users still pay the cost to download, parse and execute the components for interactivity after the initial content loads (AKA [Hydration](https://reactjs.org/docs/react-dom.html#hydrate)). After hydration, the SSR part is never used again. Subsequent updates on the page either require a network call from the client-side or a total refresh of the page, which will cause the loss of states.

Server component, on the other hand, is not meant to replace server-side rendering, but complement it. Instead of returning HTML string to the client, the server component returns a JSON description of the rendered UI elements (Virtual DOM). Using them together allows for faster initial load by first rendering into an intermediate format, then having server-side rendering infrastructure converts into HTML.

![JSON Description of UI element](/server_component/jsxon.png 'JSON Description of UI element')

For the update sequence, when the client triggers a request that a given unit of UI is refetched, the whole process happens on the server and then progressively streamed to the client. After that, React on the client-side takes over by merging the changes with existing components on screen. This approach not only helps preserves important UI states such as focus or typing inputs but is also likely to reduce bundle size because the component only renders on the server and never shipped to the client.

## Conclusion

**Good user experience**, **cheap maintenance**, and **fast performance**. Which two do you choose?

Historically, React forced you to choose two out of three of these constraints. And this is what the server component proposal is trying to solve. To give your users a good experience by tying together each lower-level component that gets pushed around based on asynchronous data resolving. To provide developers cheap maintenance by delegating data requirements as low down the component tree as possible. And to allow fast performance by eliminating the high latency network calls and large bundle size that slow down the overall page display.

While the news about the server component is all exciting, it is still in the research and development phase and not yet ready. According to React team, server components will first be introduced to frameworks like NextJs or in the form of [webpack](https://webpack.js.org/) or [parcel](https://parceljs.org/) plugins.

In the current state of React, all the components in any React application can be considered either an isomorphic component if the codebase is using server-side rendering or client component if there is no server-side rendering. With the addition of server component, things will get quite scary because we'll need to think about three types of components (server, client and shared) that behave differently based on the environment instead of one.
