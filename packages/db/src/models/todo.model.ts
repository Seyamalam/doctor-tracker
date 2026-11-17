import mongoose from "mongoose";

const { Schema, model } = mongoose;

const todoSchema = new Schema(
  {
    completed: {
      default: false,
      type: Boolean,
    },
    id: {
      default: () => new mongoose.Types.ObjectId().toString(),
      required: true,
      type: String,
    },
    text: {
      required: true,
      type: String,
    },
  },
  {
    collection: "todo",
    id: false,
  }
);

const Todo = model("Todo", todoSchema);

export { Todo };
