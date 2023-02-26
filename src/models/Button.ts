import { Schema, model, connect } from "mongoose";

const buttonSchema = new Schema({
  customId: {
    type: String,
    required: false,
    default: null,
  },
  value: {
    type: String,
    required: true,
  },
  reply: {
    type: String,
    required: false,
    default: null,
  },
});

const Button = model("Button", buttonSchema);
export default Button;
