import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { Wallet } from "./wallet.model";
import { WalletStatus } from "../../types";
import { User } from "../user/user.model";


const checkWalletValid = async (userId: string) => {
  const wallet = await Wallet.findOne({ userId });

  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
  }

  if (wallet.isBlocked === WalletStatus.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "Your wallet is blocked");
  }

  return wallet;
};

const getWalletByUserId = async (userId: string) => {
  return checkWalletValid(userId);
};

const topUp = async (userId: string, amount: number) => {
  if (amount <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Amount must be greater than 0");
  }

  const wallet = await checkWalletValid(userId);
  wallet.balance += amount;
  return wallet.save();
};

const withdraw = async (userId: string, amount: number) => {
  if (amount <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Amount must be greater than 0");
  }

  const wallet = await checkWalletValid(userId);

  if (wallet.balance < amount) {
    throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");
  }

  wallet.balance -= amount;
  return wallet.save();
};

const sendMoney = async (senderId: string, receiverPhone: string, amount: number) => {
  if (amount <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Amount must be greater than 0");
  }

  const senderWallet = await checkWalletValid(senderId);

  if (senderWallet.balance < amount) {
    throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");
  }

  const receiverUser = await User.findOne({ phone: receiverPhone });
  if (!receiverUser) {
    throw new AppError(httpStatus.NOT_FOUND, "Receiver not found");
  }

  const receiverWallet = await checkWalletValid(receiverUser._id.toString());

  senderWallet.balance -= amount;
  receiverWallet.balance += amount;

  await Promise.all([senderWallet.save(), receiverWallet.save()]);

  return {
    senderBalance: senderWallet.balance,
    receiverBalance: receiverWallet.balance,
  };
};

const getAllWallets = async () => {
  return Wallet.find().populate("userId", "name email phone role");
};

export const WalletService = {
  getWalletByUserId,
  topUp,
  withdraw,
  sendMoney,
  getAllWallets,
};
