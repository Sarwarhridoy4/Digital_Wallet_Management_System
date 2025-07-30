import { z } from "zod";

const amountSchema = z
  .number()
  .refine((val) => val > 0, {
    message: "Amount must be greater than 0",
  });

export const topUpSchema = z.object({
  body: z.object({
    amount: amountSchema,
  }),
});

export const withdrawSchema = z.object({
  body: z.object({
    amount: amountSchema,
  }),
});

export const sendMoneySchema = z.object({
  body: z.object({
    amount: amountSchema,
    receiverPhone: z
      .string()
      .min(11, "Phone number must be at least 11 digits"),
  }),
});

export const WalletValidation = {
  topUpSchema,
  withdrawSchema,
  sendMoneySchema,
};
