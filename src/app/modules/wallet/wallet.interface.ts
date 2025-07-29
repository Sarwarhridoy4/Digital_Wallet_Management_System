import { Types } from "mongoose";

export interface IWallet {
  user: Types.ObjectId;         // Reference to User
  balance: number;              // Available balance
  isBlocked: boolean;           // Whether wallet is blocked
  createdAt?: Date;             // Auto timestamp
  updatedAt?: Date;             // Auto timestamp
}
