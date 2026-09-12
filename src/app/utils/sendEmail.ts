import { envVars } from "../config/env";
import path from "path";
import ejs from "ejs";
import AppError from "../helper/AppError";
import { Resend } from "resend";

interface SendEmailOptions {
  to: string;
  subject: string;
  templateName: string;
  templateData: Record<string, any>;
}

const resendClient = new Resend(envVars.RESEND_EMAIL_SECRET_KEY);

export const sendEmail = async (options: SendEmailOptions) => {
  const { to, subject, templateName, templateData } = options;
  try {
    const templatePath = path.resolve(
      process.cwd(),
      `src/app/templates/${templateName}.ejs`,
    );

    const template = await ejs.renderFile(templatePath, templateData);

    const info = await resendClient.emails.send({
      from: envVars.RESEND_EMAIL!,
      to: [to],
      subject,
      html: template,
    });

    return { success: info.data?.id ? true : false, messageId: info.data?.id };
  } catch (error: any) {
    throw new AppError(error.message, 500);
  }
};
