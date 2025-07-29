// src/app/modules/transaction/transaction.interface.ts

import { Types } from "mongoose";
import { TransactionStatus, TransactionType } from "./transaction.constant";

export interface ITransaction {
  type: TransactionType;
  sender: Types.ObjectId | null;
  receiver: Types.ObjectId;
  amount: number;
  status: TransactionStatus;
  notes?: string;
  timestamp?: Date;
}
