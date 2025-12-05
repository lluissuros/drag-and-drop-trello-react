Mis apuntes!

Arquitecture:

- Components:

* Board: Manages Dnd drag handlers (used to move the Tasks)
* Column: Dropable Container
* Task: Dragabble/Sortable
* AddTaskForm

- State: Provided by BoardContext, also provides the methods to alter state, and persists internally

- moveTask and addTask as separate utils (like a business logic layer), so they are simple ts functions that we can throroghly unit test
- separated BoradRepository that loads and saves (currently on LocalStorage, but could be any other DB, or call APIs)

* [NOTE]: Optimistic UI at the moment (I update state before persisting, and right now if persistence fails, it is NOT rolled back and state is inconsiste. This would be problematic if it were a REST api for example.) Possible fix: Use ReactQuery (mutation), or just save previous board value and restore it

-[NOTE]: not fully responsive, I did it like in the Trello app

[TODO]: I didnt find a good way to test drag and drop movements (Board.test), in the interest of time I will leave the matter for now. Maybe it's possible to have integration tests with Playwright, it worth taking a look if I have time

- [TODO]: I'd like to add a resetBoard and deleteTask functions, they would also be provided by the BoardContext

- [TODO] Currently both the board state and functions to manage it are provided by the same BoardContext. This should work fine, but also worth considering the reducer approach + separating the dispatch and state Contexts/hooks as in https://react.dev/learn/scaling-up-with-reducer-and-context (I find the dispatch pattern quite nit)

-[TODO] didnt have time to find a satisfying solution for testing drag and drop

-[BUG]: Doing create should only allow 2 tasks

-[TODO-BUG]: Sortable doesnt sort, probably we need to create the logic on onDragEnd (over.id provides the task we are locating over) to order if origin and target column is the same, and also update the state in the context (probably another function?) https://docs.dndkit.com/presets/sortable
