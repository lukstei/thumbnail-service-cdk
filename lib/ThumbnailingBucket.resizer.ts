import AWS, { S3 } from "aws-sdk";
import {
    S3Event
} from "aws-lambda";
import sharp from "sharp";

// extracts the extension from a path and returns [path without extension, extension]
function pathParts(name: string) {
    const groups = /^(.+)\.(.+?)$/.exec(name);
    if (!groups) {
        return [name, ""];
    }
    const [, base, ext] = groups;
    return [base, ext];
}

export const handler = async (
    event: S3Event
): Promise<void> => {
    AWS.config.logger = console;

    const destBucket = process.env.DEST_BUCKET!;
    console.log(JSON.stringify(event));
    const s3 = new S3();

    for (const s3Event of event.Records) {
        const key =  decodeURIComponent(s3Event.s3.object.key.replace(/\+/g, ' ')); // space is encoded as +
        const obj = await s3.getObject({
            Bucket: s3Event.s3.bucket.name,
            Key: key,
        }).promise();

        const [base, ext] = pathParts(key);

        const list = [];

        for (let size of [50, 100, 200]) {
            const out = await sharp(obj.Body! as Buffer).resize({
                height: size,
                width: size
            }).toBuffer({ resolveWithObject: true });
            const destKey = `${base}-${size}x${size}.${out.info.format}`;
            console.log(`${key}: Creating ${destKey}`);
            await s3.putObject({
                Bucket: destBucket,
                Key: destKey,
                Body: out.data
            }).promise();
            list.push({
                key: destKey,
                url: `https://${destBucket}.s3.amazonaws.com/${destKey}`,
                width: size,
                height: size
            });
        }

        console.log(`${key}: Creating thumbnails.json`);
        await s3.putObject({
            Bucket: destBucket,
            Key: `${key}.thumbnails.json`,
            Body: JSON.stringify(list),
            ContentType: "application/json"
        }).promise();
    }
};
