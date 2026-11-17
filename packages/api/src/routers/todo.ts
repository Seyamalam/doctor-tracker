import { Todo } from "@doctor-tracker/db/models/todo.model";
import "@doctor-tracker/db";
import z from "zod";

import { router, publicProcedure } from "../index";

export const todoRouter = router({
  getAll: publicProcedure.query(async () => {
    const todos = await Todo.find().lean();
    return todos.map((todo) => ({ ...todo, id: todo.id }));
  }),

  create: publicProcedure
    .input(z.object({ text: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const newTodo = await Todo.create({ text: input.text });
      const todo = newTodo.toObject();
      return { ...todo, id: todo.id };
    }),

  toggle: publicProcedure
    .input(z.object({ id: z.string(), completed: z.boolean() }))
    .mutation(async ({ input }) => {
      await Todo.updateOne({ id: input.id }, { completed: input.completed });
      return { success: true };
    }),

  delete: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    await Todo.deleteOne({ id: input.id });
    return { success: true };
  }),
});
