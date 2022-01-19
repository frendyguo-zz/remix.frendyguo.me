---
title: 'Optimize Web with Resource Hints: Preconnect, Prefetch, Preload and DNS-Prefetch'
date: '2021-01-13'
featuredImage: '/resource_hints/highway.jpg'
shortDesc: Hint browsers to be more efficient with resource.
---

When you access a web page, a browser goes through a sequence of steps called [Critical Rendering Path (CRP)](https://developers.google.com/web/fundamentals/performance/critical-rendering-path) in order to convert HTML, CSS, and Javascript into a functioning website.

A Critical Rendering Path starts with an HTML request. The browser then parses the HTML before it can construct the DOM tree, in which, it initiates a request to each external resource found, followed by the construction of CSSOM. With the DOM and CSSOM complete, the browser builds the render tree, compute styles, define the location and size of all the render tree elements. And finally, render the content on the screen.

The faster the browser can go through the sequences, the faster the user can perceive the content. So that brings us to the next question. **How can we improve the Critical Rendering Path?**

Primarily, there are two effective ways a CRP can be optimized:

1. Minimize the number of critical resources by deferring, or eliminate them altogether.
2. Optimize the order in which critical resources are prioritized.

Conveniently enough, **resource hints** can help in both cases.

## Resource Hints

Under the hood, modern browsers initiate one or more heuristic rule-based speculative optimization techniques based on document structure, navigation history, and user context such as device type, memory resource, network connectivity, and so on. These techniques have proven to work well.

Considering for each request, a browser has to perform a DNS resolution, TLS negotiations, TCP handshake, followed by establishing an HTTP connection. A strategically placed resource hints allow for further optimization of resource delivery.

There are four commonly used hints that are widely supported by modern browsers:

- **DNS-Prefetch**
- **Preconnect**
- **Prefetch**
- **Preload**

### DNS-Prefetch

`dns-prefetch` hint tells the browser to perform a DNS resolution on the target domain. When a browser requests resources from a third-party server, it must first resolve the origin's IP address before it can issue a request. This process is called DNS resolution.

Example of dns-prefetch:

```html
  <link rel="dns-prefetch" href="//fonts.gstatic.com/">
```

![DNS Prefetch](/resource_hints/dns_prefetch.png)

Here, resolving a target DNS early effectively speed up the future resource exchange.

### Preconnect

A `preconnect` hint tells the browser to preemptively establish a connection to a target domain (including DNS resolution). Preconnect is useful when you know you'll be needing resources from the target domain and want to speed things up by preparing the necessary connection requirements.

Adding a preconnect hint is as simple as adding `<link>` tag to a HTML `<head>`:

```html
  <link rel="preconnect" href="https://fonts.gstatic.com/" crossorigin="">
```

**No Preconnect**
![No Preconnect](/resource_hints/no_preconnect.png)

**With Preconnect**
![With Preconnect](/resource_hints/preconnect.png)

As you can see, by triggering a preconnect hint, we can minimize the amount of waiting time.

You might ask, **why don't we preconnect all the links?**

Actually, preconnect to all links is never a good idea because of two reasons,

- **Too many preconnects**

  Connections are expensive and can take valuable CPU times. By trying to preconnect to many links, we actually limit the browsers from making connections it actually needs.

- **Preconnect to unused domain**

  Browsers can only open so many connections simultaneously, connection idle for 10 seconds will be closed by the browser, wasting the earlier connection work.

### Preload

`preload` hint tells the browser to preemptively fetch and cache the target resource sooner than the browser would otherwise discover. Note that the browser doesn't actually evaluate the resources, it only cache them, so when something else needs it, it's immediately available.

Preload can be used to prioritize late discovered resources. Web fonts are one of the examples of late discovered resources because of the way it was referenced (Usually inside the CSS). Consequently, late discovered web fonts can potentially cause **FOIT** (Flash of Invisible Text) or **FOUT** (Flash of Unstyled Text), which is well... not good for user experience.

Here's how you can tell browser to do a font preload:

```html
  <link rel="preload" as="font" href="https://example-cdn.com/custom-font.woff" type="font/woff2" crossorigin="anonymous">
```

![Preload Network](/resource_hints/preload.png)

In the example above, we signal the browser to preload a font `custom-font.woff`, `as` is only used when `rel="preload"` or `rel="prefetch"` has been set on the `<link>` element. It specifies the type of resource which is necessary for request matching. Furthermore, it is also being used to allow the browser to [prioritize critical resource loading more accurately](https://css-tricks.com/the-critical-request/#how-does-chrome-prioritize-resources).

`type="font/woff2"` indicates the correct MIME type of the linked resource, and last but not least, `crossorigin="anonymous"` . Because of various reasons, a `font` type resource has to be fetched using [anonymous-mode CORS](https://drafts.csswg.org/css-fonts/#font-fetching-requirements).

### Prefetch

`prefetch` works almost like `preload`, it tells the browser to fetch and cache the target resource. Only the download happens with a low priority and only during browser idle time, so it doesn't interfere with more important resources. Prefetched resources are kept in the HTTP Cache or the memory cache depending on whether the resource is cachable or not.

`prefetch` can greatly improve the load times of future navigations by prefetching subsequent pages that the users are likely to navigate to.

Here's an example of prefetch hint:

```html
  <!-- Resource with prefetch -->
  <link rel="prefetch" as="stylesheet" href="/style1.css">

  <!-- Resource without prefetch -->
  <link rel="stylesheet" href="/style2.css">
```

![Prefetch Network](/resource_hints/prefetch.png)

Above, the prefetched resource has a lower priority even though it was referenced first. With this hint, we can tell the browser to download below the fold resources in order to help speed up future navigation, making it appears to load instantly.

However, excessive prefetch hints performed actually cause more harm than good, as each request costs users extra bytes that might not be used.

Additionally, prefetching when users are on slow connections is just plain bad. Since there's only so much bandwidth you can allocate for each resource. Fortunately, you can leverage [Network Information API](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/effectiveType) to conditionally prefetch resource based on users' network condition.

## Conclusion

Being competitive online is more important than ever. Having a product that just works is no longer enough, you need it to work fast.

In this post, we talk about several commonly used resource hints that we can leverage to efficiently manage resource transfer so that we can achieve the shortest Critical Rendering Path. While the resource hints implementation is fairly straightforward, knowing which hint to use on which resource is the tricky part.

Resource hints however are not without risk. Poorly implemented hints cause harm in two ways. Firstly, it downloads unused resources, and each unused byte costs users their data plan. Secondly, it causes a performance bottleneck that chips away users' valuable seconds.
