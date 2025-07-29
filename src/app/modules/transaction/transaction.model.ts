// src/app/modules/transaction/transaction.model.ts

import { Schema, model } from "mongoose";
import { ITransaction } from "./transaction.interface";
import { TransactionStatus, TransactionType } from "./transaction.constant";

const transactionSchema = new Schema<ITransaction>(
  {
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    sender: { type: Schema.Types.ObjectId, ref: "User", default: null },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.SUCCESS,
    },
    notes: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const Transaction = model<ITransaction>(
  "Transaction",
  transactionSchema
);
