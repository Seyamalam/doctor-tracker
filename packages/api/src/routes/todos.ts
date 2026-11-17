import "@doctor-tracker/db";
import { Todo } from "@doctor-tracker/db/models/todo.model";
import { Router } from "express";
import { z } from "zod";

import { asyncHandler } from "../lib/async-handler";

const createTodoSchema = z.object({
  text: z.string().min(1),
});

const updateTodoSchema = z.object({
  completed: z.boolean(),
});

export const todosRouter = Router();

todosRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const todos = await Todo.find().lean();
    res.json(todos.map((todo) => ({ ...todo, id: todo.id })));
  })
);

todosRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = createTodoSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Validation failed", issues: parsed.error.issues });
      return;
    }
    const created = await Todo.create({ text: parsed.data.text });
    const todo = created.toObject();
    res.status(201).json({ ...todo, id: todo.id });
  })
);

todosRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const parsed = updateTodoSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Validation failed", issues: parsed.error.issues });
      return;
    }
    const result = await Todo.updateOne(
      { id: req.params.id },
      { completed: parsed.data.completed }
    );
    if (result.matchedCount === 0) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }
    res.json({ success: true });
  })
);

todosRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const result = await Todo.deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }
    res.status(204).end();
  })
);
