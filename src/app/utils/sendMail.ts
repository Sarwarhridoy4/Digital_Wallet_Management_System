/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

import ejs from "ejs";
import path from "path";
import { Resend } from "resend";
import AppError from "../errorHelpers/AppError";
import envConfig from "../config/env";

const resend = new Resend(envConfig.RESEND_API_KEY);

interface SendEmailOptions {
  to: string;
  subject: string;
  templateName: string;
  templateData?: Record<string, any>;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType: string;
  }[];
}

export const sendEmail = async ({
  to,
  subject,
  templateName,
  templateData,
  attachments,
}: SendEmailOptions) => {
  try {
    const templatePath = path.join(
      process.cwd(),
      "src",
      "emails",
      "templates",
      `${templateName}.ejs`,
    );

    const html = await ejs.renderFile(templatePath, templateData);

    const response = await resend.emails.send({
      from: envConfig.EMAIL_FROM,
      to,
      subject,
      html,
      attachments: attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType,
      })),
    });

    if (response.data?.id) {
      console.log("📧 Email sent:", response.data.id);
    }
  } catch (error: any) {
    console.error("Email sending failed:", error);
    throw new AppError(500, "Email service unavailable");
  }
};
