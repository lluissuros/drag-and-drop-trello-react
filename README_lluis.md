Mis apuntes!

-[TODO] review Board -> BoardTestApi

-[TODO]: Add Card Form as a separate component with logic

-[TODO]: Task with logic for moving?

-[BUG]: Doing create should only allow 2 tasks

-[BUG]: Sortable doesnt sort, probably we need to create the logic on onDragEnd (over.id provides the task we are locating over) to order if origin and target column is the same, and also update the state in the context (probably another function?) https://docs.dndkit.com/presets/sortable

-[TODO]: I didnt find a good way to test drag and drop movements (Board.test), in the interest of time I will leave the matter for now. Maybe it's possible to have integration tests with Playwright, it worth taking a look if I have time

- Optimistic UI de momento (I update state before persisting, and right now if persistence fails, it is NOT rolled back and state is inconsiste. This would be problematic if it were a REST api for example.) Possible fix: Use ReactQuery (mutation), or just save previous board value and restore it

- Components:
- Board: Manages Dnd drag handlers (used to move the Tasks)

- [TODO] Currently both the board state and functions to manage it are provided by the same BoardContext. This should work fine, but also worth considering the reducer approach + separating the dispatch and state Contexts/hooks as in https://react.dev/learn/scaling-up-with-reducer-and-context (I find the dispatch pattern quite nit)

- moveTask and addTask as separate utils (like a business logic layer), so they are simple ts functions that we can deeply unit test

- not fully responsive, like in Trello app
