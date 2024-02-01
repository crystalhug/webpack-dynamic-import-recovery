import { types, getSnapshot, onSnapshot } from "mobx-state-tree";

const Todo = types
  .model({
    id: types.identifierNumber,
    name: types.optional(types.string, ""),
    done: types.optional(types.boolean, false),
  })
  .actions((self) => ({
    setName(newName) {
      self.name = newName;
    },

    toggle() {
      self.done = !self.done;
    },
  }));

const User = types.model({
  name: types.optional(types.string, ""),
});

const RootStore = types
  .model({
    users: types.map(User),
    todos: types.map(Todo),
  })
  .actions((self) => ({
    addTodo(id, name) {
      self.todos.set(id, Todo.create({ id, name }));
    },
  }));

const store = RootStore.create();

var states = [];
var currentFrame = -1;
onSnapshot(store, (snapshot) => {
  if (currentFrame === states.length - 1) {
    currentFrame++;
    states.push(snapshot);
  }
  console.log("onSnapshot -- index", snapshot);
});

// store.addTodo(1, "Eat a cake");
// console.log(
//   "todos --- add",
//   store.todos.get(1).toJSON().done,
//   "todos",
//   store.todos.toJSON()
// );
// store.todos.get(1).toggle();
// console.log(
//   "todos --- update",
//   store.todos.get(1).toJSON().done,
//   "todos",
//   store.todos.toJSON()
// );

// console.log("getSnapshot", getSnapshot(store));
// console.log("getSnapshot - todos", getSnapshot(store.todos));

export function previousState() {
  if (currentFrame === 0) return;
  currentFrame--;
  applySnapshot(store, states[currentFrame]);
}

export function nextState() {
  if (currentFrame === states.length - 1) return;
  currentFrame++;
  applySnapshot(store, states[currentFrame]);
}

export default store;
