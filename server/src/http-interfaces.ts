import { HttpResponse, HttpResponseOptions } from "@scrypted/sdk/types";
import { Response } from "express";
import mime from "mime";
import AdmZip from "adm-zip";
import { PROPERTY_PROXY_ONEWAY_METHODS } from "./rpc";

export function createResponseInterface(res: Response, zip: AdmZip): HttpResponse {
    class HttpResponseImpl implements HttpResponse {
        [PROPERTY_PROXY_ONEWAY_METHODS] = [
            'send',
            'sendFile',
        ];

        send(body: string): void;
        send(body: string, options: HttpResponseOptions): void;
        send(body: Buffer): void;
        send(body: Buffer, options: HttpResponseOptions): void;
        send(body: any, options?: any) {
            if (options?.code)
                res.status(options.code);
            if (options?.headers) {
                for (const header of Object.keys(options.headers)) {
                    res.setHeader(header, (options.headers as any)[header]);
                }
            }

            res.send(body);
        }

        sendFile(path: string): void;
        sendFile(path: string, options: HttpResponseOptions): void;
        sendFile(path: any, options?: HttpResponseOptions) {
            if (options?.code)
                res.status(options.code);
            if (options?.headers) {
                for (const header of Object.keys(options.headers)) {
                    res.setHeader(header, (options.headers as any)[header]);
                }
            }

            if (!res.getHeader('Content-Type'))
                res.contentType(mime.lookup(path));

            const data = zip.getEntry(`fs/${path}`)?.getData();
            if (!data) {
                res.status(404);
                res.end();
                return;
            }
            res.send(data);
        }
    }

    return new HttpResponseImpl();
}
