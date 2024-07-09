import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as rawBody from 'raw-body';


@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        if (req.headers['content-type'] === 'application/json') {
            rawBody(req, {
                length: req.headers['content-length'],
                limit: '1mb',
                encoding: 'utf8',
            }, (err, string) => {
                if (err) {
                    return next(err);
                }
                req['rawBody'] = string;
                next();
            });
        } else {
            next();
        }
    }
}