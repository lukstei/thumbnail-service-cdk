import { Construct, Duration, RemovalPolicy } from "@aws-cdk/core";
import * as s3 from '@aws-cdk/aws-s3';
import * as s3notify from '@aws-cdk/aws-s3-notifications';
import * as lambda_node from "@aws-cdk/aws-lambda-nodejs";
import * as lambda from "@aws-cdk/aws-lambda";

export interface ThumbnailingBucketProps {
    name?: string;
}

export class ThumbnailingBucket extends Construct {
    sourceBucket: s3.Bucket;
    destBucket: s3.Bucket;
    func: lambda_node.NodejsFunction;

    constructor(scope: Construct, id: string, props: ThumbnailingBucketProps = {}) {
        super(scope, id);

        this.sourceBucket = new s3.Bucket(this, 'sourceBucket', {
            bucketName: props.name,
            removalPolicy: RemovalPolicy.DESTROY
        });
        this.destBucket = new s3.Bucket(this, 'destBucket', {
            bucketName: `${this.sourceBucket.bucketName}-thumbs`,
            removalPolicy: RemovalPolicy.DESTROY
        });
        this.func = new lambda_node.NodejsFunction(this, 'resizer', {
            bundling: {
                forceDockerBundling: true,
                nodeModules: ['sharp'],
            },
            timeout: Duration.minutes(1),
            memorySize: 256,
            functionName: `${props.name}-resizer`,
            runtime: lambda.Runtime.NODEJS_14_X,
            environment: {
                DEST_BUCKET: this.destBucket.bucketName
            },
        });

        [".jpg", ".jpeg", ".png"].forEach(suffix =>
            this.sourceBucket.addObjectCreatedNotification(
                new s3notify.LambdaDestination(this.func), { suffix: suffix }));
        this.sourceBucket.grantRead(this.func);
        this.destBucket.grantWrite(this.func);
    }
}