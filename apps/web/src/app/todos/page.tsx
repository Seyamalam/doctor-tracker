"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@ui-sdk/react/button";
import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox";
import { Input } from "@ui-sdk/react/input";
import { CheckIcon, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";

import { api } from "@/lib/api";
import type { Todo } from "@/lib/api";

type TodoId = Todo["id"];

const TODOS_KEY = ["todos"] as const;

const TodosPage = () => {
  const [newTodoText, setNewTodoText] = useState("");

  const queryClient = useQueryClient();
  const invalidateTodos = () =>
    queryClient.invalidateQueries({ queryKey: TODOS_KEY });

  const todos = useQuery({ queryFn: api.todos.list, queryKey: TODOS_KEY });
  const createMutation = useMutation({
    mutationFn: (text: string) => api.todos.create(text),
    onSuccess: () => {
      invalidateTodos();
      setNewTodoText("");
    },
  });
  const toggleMutation = useMutation({
    mutationFn: ({ id, completed }: { id: TodoId; completed: boolean }) =>
      api.todos.update(id, { completed }),
    onSuccess: invalidateTodos,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: TodoId) => api.todos.remove(id),
    onSuccess: invalidateTodos,
  });

  const handleAddTodo = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newTodoText.trim()) {
      createMutation.mutate(newTodoText);
    }
  };

  const handleToggleTodo = (id: TodoId, completed: boolean) => {
    toggleMutation.mutate({ completed: !completed, id });
  };

  const handleDeleteTodo = (id: TodoId) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="mx-auto w-full max-w-md py-10">
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="border-b border-gray-200 p-6 dark:border-gray-800">
          <h2 className="text-lg font-semibold">Todo List</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your tasks efficiently
          </p>
        </div>
        <div className="p-6">
          <form
            className="mb-6 flex items-center space-x-2"
            onSubmit={handleAddTodo}
          >
            <Input
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-900"
              disabled={createMutation.isPending}
              onValueChange={(value) => setNewTodoText(value)}
              placeholder="Add a new task..."
              value={newTodoText}
            />
            <Button
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
              disabled={createMutation.isPending || !newTodoText.trim()}
              type="submit"
            >
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Add"
              )}
            </Button>
          </form>

          {(() => {
            if (todos.isLoading) {
              return (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              );
            }
            if (todos.data?.length === 0) {
              return (
                <p className="py-4 text-center">No todos yet. Add one above!</p>
              );
            }
            return (
              <ul className="space-y-2">
                {todos.data?.map((todo) => (
                  <li
                    className="flex items-center justify-between rounded-md border border-gray-200 p-2 dark:border-gray-800"
                    key={todo.id}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={todo.completed}
                        className="flex h-4 w-4 items-center justify-center rounded border border-gray-400 data-checked:bg-gray-900 data-checked:text-white dark:border-gray-600"
                        id={`todo-${todo.id}`}
                        onCheckedChange={() =>
                          handleToggleTodo(todo.id, todo.completed)
                        }
                      >
                        <CheckboxIndicator>
                          <CheckIcon aria-hidden="true" className="h-3 w-3" />
                        </CheckboxIndicator>
                      </Checkbox>
                      <label
                        className={`${todo.completed ? "text-gray-400 line-through" : ""}`}
                        htmlFor={`todo-${todo.id}`}
                      >
                        {todo.text}
                      </label>
                    </div>
                    <Button
                      aria-label="Delete todo"
                      className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800"
                      onClick={() => handleDeleteTodo(todo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default TodosPage;
