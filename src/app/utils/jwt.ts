
import jwt, { SignOptions } from "jsonwebtoken";


const createToken = (payload: object, secret: string, {expiresIn}: SignOptions) => {
    const token = jwt.sign(payload, secret, {expiresIn} as SignOptions);
    return token;
}
    
const verifyToken = (token: string, secret: string) => {
    try {
        const decoded = jwt.verify(token, secret);
        return {
            success : true,
            data : decoded,
            error : null
        }
    } catch (error : any) {
        return {
            success : false,
            data : null,
            error : error.message
        }
    }
}

const decodeToken = (token: string) => {
    const decoded = jwt.decode(token);
    return decoded;
}

export const jwtUtils = {
    createToken,
    verifyToken,
    decodeToken
}