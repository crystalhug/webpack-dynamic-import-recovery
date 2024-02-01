import { createRoot } from "react-dom/client";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import store from "./module";
import { values } from "mobx";
// import store from "../store.js";

let id = 1;
const randomId = () => ++id;

const TodoView = observer((props) => (
  <div>
    <input
      type="checkbox"
      checked={props.todo.done}
      onChange={(e) => props.todo.toggle()}
    />
    <input
      type="text"
      value={props.todo.name}
      onChange={(e) => props.todo.setName(e.target.value)}
    />
  </div>
));

const Index = observer(({ store }) => {
  console.log("values(store.todos)", store.todos, values(store.todos));
  return (
    <div>
      Index components
      <button onClick={(e) => store.addTodo(randomId(), "New Task")}>
        Add Task
      </button>
      {values(store.todos).map((todo) => (
        <TodoView todo={todo} key={todo.id} />
      ))}
    </div>
  );
});

const root = createRoot(document.getElementById("root"));
root.render(
  // <Provider store={store}>
  <Index store={store} />
  // </Provider>
);


