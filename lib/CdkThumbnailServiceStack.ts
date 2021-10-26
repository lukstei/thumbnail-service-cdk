import * as cdk from '@aws-cdk/core';
import { CfnOutput } from "@aws-cdk/core";
import { ThumbnailingBucket } from "./ThumbnailingBucket";

export class CdkThumbnailServiceStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const thumbnailer = new ThumbnailingBucket(this, "Thumbnailer", {
            name: "lukstei-pictures2"
        });

        new CfnOutput(this, "SourceBucketUrl", {
            description: "Source Bucket",
            value: `https://s3.console.aws.amazon.com/s3/buckets/${thumbnailer.sourceBucket.bucketName}`
        })
        new CfnOutput(this, "DestBucketUrl", {
            description: "Destination Bucket",
            value: `https://s3.console.aws.amazon.com/s3/buckets/${thumbnailer.destBucket.bucketName}`
        })
        new CfnOutput(this, "LambdaOut", {
            description: "Lambda ARN",
            value: thumbnailer.func.functionArn
        })
    }
}
