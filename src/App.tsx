import React from "react";
import "./App.css";

export default function App() {
  return (
    <main className="overflow-x-auto">
      <h1 className="text-left text-4xl font-bold p-10 pb-0">Kanban Board</h1>
      <div className="flex p-10 gap-x-4 min-w-max">
        <div className="flex flex-col w-1/2 min-w-[300px] bg-gray-200 rounded p-4">
          <h2 className="font-bold mb-2">In Progress</h2>
          <ul>
            <li className={`bg-white p-2 rounded mb-2 shadow`} draggable>
              Test application
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
