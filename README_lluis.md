Mis apuntes!

-[TODO] review Board -> BoardTestApi

- Optimistic UI de momento (I update state before persisting, and right now if persistence fails, it is NOT rolled back and state is inconsiste. This would be problematic if it were a REST api for example.) Possible fix: Use ReactQuery (mutation), or just save previous board value and restore it

- [TODO] Currently both the board state and functions to manage it are provided by the same BoardContext. This should work fine, but also worth considering the reducer approach + separating the dispatch and state Contexts/hooks as in https://react.dev/learn/scaling-up-with-reducer-and-context (I find the dispatch pattern quite nit)

- moveTask and addTask as separate utils (like a business logic layer), so they are simple ts functions that we can deeply unit test

- not fully responsive, like in Trello app
