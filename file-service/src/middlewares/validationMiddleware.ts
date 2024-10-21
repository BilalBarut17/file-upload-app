import { Request, Response, NextFunction } from 'express';

// Dosya türü doğrulama middleware'i
export const validateFileType = (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;

    // Eğer dosya yüklenmemişse hata döndür
    if (!file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    // İzin verilen dosya türlerini tanımlıyoruz (sadece image/jpeg ve image/png)
    const allowedMimeTypes = ['image/jpeg', 'image/png'];

    // Eğer yüklenen dosya izin verilen türlerde değilse hata döndür
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({ message: 'Invalid file type. Only JPEG and PNG are allowed.' });
    }

    // Eğer dosya geçerliyse, sonraki middleware'e geç
    next();
};
