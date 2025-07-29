import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import httpStatus from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { UserServices } from "./user.service";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;

  // Extract buffers and original filenames safely
  const profileBuffer = files?.["profile_picture"]?.[0]?.buffer;
  const profileOriginalName = files?.["profile_picture"]?.[0]?.originalname;

  const identifierBuffer = files?.["identifier_image"]?.[0]?.buffer;
  const identifierOriginalName = files?.["identifier_image"]?.[0]?.originalname;

  //   // Call service to create user
  const user = await UserServices.createUser(
    req.body,
    profileBuffer,
    profileOriginalName,
    identifierBuffer,
    identifierOriginalName
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User Created Successfully",
    data: user
  });
});

export const UserControllers = {
  createUser,
};
