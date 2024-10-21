import { Request, Response, NextFunction } from 'express';

      //----- Genel hata yakalayıcı middleware------//
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);  // Hatanın ayrıntısını sunucu konsoluna yazdır

    // Hata ile ilgili genel bir yanıt döndür
    res.status(500).json({
        message: 'Internal Server Error',
        error: err.message, // Hata mesajını döndür
    });
};
