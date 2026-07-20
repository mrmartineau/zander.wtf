---
title: React compound components
tags:
  - react
  - javascript
link: https://jjenzz.com/compound-components
date: 2026-07-20
---

```jsx
import React, { useContext } from 'react'

const Context = React.createContext()

const List = ({ isSmall = false, children, ...props }) => (
  <ul {...props} style={{ padding: isSmall ? '5px' : '10px' }}>
    <Context.Provider value={isSmall}>{children}</Context.Provider>
  </ul>
)

const ListItem = ({ children, ...props }) => {
  const isSmall = useContext(Context)

  return (
    <li {...props} style={{ padding: isSmall ? '5px' : '10px' }}>
      {children}
    </li>
  )
}

export { List, ListItem }
```

```jsx
<List isSmall>
  <ListItem>Cat</ListItem>
  <ListItem>Dog</ListItem>
</List>
```

Note: in React 19 you can render `<Context value={isSmall}>` directly instead of `<Context.Provider value={isSmall}>`, and `use(Context)` is the newer alternative to `useContext`.

Another example: https://egghead.io/lessons/react-write-compound-components
