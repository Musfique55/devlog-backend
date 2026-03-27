import nodemailer from "nodemailer";
import { envVars } from "../config/env";
import path from 'path';
import ejs from 'ejs';
import AppError from "../helper/AppError";

interface SendEmailOptions {
  to: string;
  subject: string;
  templateName : string;
  templateData: Record<string,any>;
  attachments?: {
    filename: string;
    content : Buffer | string;
    contentType: string;
  }[];
}



const transporter = nodemailer.createTransport({
  host: envVars.EMAIL_SENDER_SMTP_HOST,
  port: Number(envVars.EMAIL_SENDER_SMTP_PORT),
  secure: true, 
  auth: {
    user: envVars.EMAIL_SENDER_SMTP_USER,
    pass: envVars.EMAIL_SENDER_SMTP_PASSWORD,
  },
});

export const sendEmail = async (options: SendEmailOptions) => {
    const { to, subject, templateName, templateData, attachments } = options;
    try {
        const templatePath = path.resolve(process.cwd(),`src/app/templates/${templateName}.ejs`);

        const template = await ejs.renderFile(templatePath,templateData);

       const info =  await transporter.sendMail({
            to,
            subject,
            html: template,
            attachments : attachments?.map(attachment => {
                return {
                    filename : attachment.filename,
                    content : attachment.content,
                    contentType : attachment.contentType
                }
            })
        });


        return {success : info.accepted.length > 0}

    } catch (error : any) {
        console.log(error);
        throw new AppError(error.message,500)
    }
}

