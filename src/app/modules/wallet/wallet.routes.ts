import { Router } from "express";
import { checkAuth } from "../../middlewares/authCheck";
import { Role } from "../../types";
import { WalletController } from "./wallet.controller";

const router = Router();
router.get(
  "/me",
  checkAuth(Role.USER, Role.AGENT),
  WalletController.viewMyWallet
);

import { WalletValidation } from "./wallet.validation";
import { validateRequest } from "../../middlewares/validateRequest";

router.patch(
  "/top-up",
  checkAuth(Role.USER),
  validateRequest(WalletValidation.topUpSchema),
  WalletController.topUpWallet
);

router.patch(
  "/withdraw",
  checkAuth(Role.USER),
  validateRequest(WalletValidation.withdrawSchema),
  WalletController.withdrawFromWallet
);

router.patch(
  "/send",
  checkAuth(Role.USER),
  validateRequest(WalletValidation.sendMoneySchema),
  WalletController.sendMoney
);

router.get("/", checkAuth(Role.ADMIN), WalletController.viewAllWallets);
export const WalletRoutes = router;
