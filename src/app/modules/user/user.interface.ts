// src/app/interfaces/user.interface.ts

import { Role, UserStatus, IdentifierType, verifyStatus } from "../../types";

export interface Identifier {
  type: IdentifierType;
  value: string;
}

export interface IUser {
  _id?: string;
  // Basic Info
  name: string;
  email: string;
  phone: string;
  password: string;
  profile_picture: string;

  // Role & Status
  role: Role;
  status: UserStatus;
  verified?: verifyStatus;

  // Identifier for KYC verification
  identifier: Identifier;

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}
