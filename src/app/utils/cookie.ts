import { CookieOptions, Request, Response } from "express";

const setCookie = (res: Response, name: string, value: string, options: CookieOptions) => {
    res.cookie(name, value, options);
  };

  const getCookie = (req: Request, name: string) => {
    return req.cookies[name];
  }

  const clearCookie = (res: Response, key: string) => {
    res.clearCookie(key);
  }

  export const cookieUtils = {
    setCookie,
    getCookie,
    clearCookie
  }

