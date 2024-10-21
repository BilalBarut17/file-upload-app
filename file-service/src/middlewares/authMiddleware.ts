import { Request, Response, NextFunction } from 'express';

export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    // Eğer token yoksa, kullanıcıya yetkilendirme hatası döndür
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized. No token provided.' });
    }

    // Örnek olarak, token'ın doğruluğunu basit bir kontrolle yapıyoruz
    // Bu kontrol gerçek bir JWT doğrulama veya API anahtarı doğrulama ile değiştirilebilir.
    if (token !== process.env.AUTH_TOKEN) {
        return res.status(401).json({ message: 'Unauthorized. Invalid token.' });
    }

    // Eğer token geçerliyse, sonraki middleware'e geç
    next();
};
