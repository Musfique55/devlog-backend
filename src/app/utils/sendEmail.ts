import { envVars } from "../config/env";
import path from "path";
import ejs from "ejs";
import AppError from "../helper/AppError";
import { BrevoClient } from "@getbrevo/brevo";

interface SendEmailOptions {
  to: string;
  subject: string;
  templateName: string;
  templateData: Record<string, any>;
}

const brevoClient = new BrevoClient({ apiKey: envVars.BREVO_API_KEY });

export const sendEmail = async (options: SendEmailOptions) => {
  const { to, subject, templateName, templateData } = options;
  try {
    const templatePath = path.resolve(
      process.cwd(),
      `src/app/templates/${templateName}.ejs`,
    );

    const template = await ejs.renderFile(templatePath, templateData);

    const info = await brevoClient.transactionalEmails.sendTransacEmail({
      sender: { name: "DevLog", email: envVars.EMAIL_SENDER_SMTP_USER },
      to: [{ email: to }],
      subject,
      htmlContent: template,
    });

    return { success: info.messageId };
  } catch (error: any) {
    console.log(error);
    throw new AppError(error.message, 500);
  }
};
