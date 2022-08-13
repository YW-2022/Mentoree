import React, { useState, useEffect } from "react";
import TodoList from "@yana4961/react-todo-list";
import "@yana4961/react-todo-list/dist/index.css";

export default function Todo(props) {
  const [todoData, setTodoData] = useState([]); // all the goals that you have

  console.log(props.goals);
  useEffect(() => {
    setTodoData(props.goals);
  }, [props.goals]);

  const [inputData, setInputData] = useState(""); //what you're entering into the input box

  function handleChange(event) {
    if (event.target.name === "inputData") {
      setInputData(event.target.value);
    }
    //console.log(updatedItems);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setTodoData([...todoData, { label: inputData, id: todoData.length + 1, done: false, important: false }]);
    console.log(todoData);
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter new item"
          onChange={handleChange}
          name="inputData"
          value={inputData}
          className="border-2 border-gray-400 rounded w-3/4 h-10 pl-2"
        />
        <button className="text-white font-bold bg-indigo-500 border-2 border-indigo-500 rounded w-1/4 h-10">Add Item</button>
      </form>
      <TodoList todoData={todoData} />
    </div>
  );
}
