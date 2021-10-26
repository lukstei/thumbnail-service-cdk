import { Stack } from '@aws-cdk/core';
import { ThumbnailingBucket } from "../lib/ThumbnailingBucket";
import '@aws-cdk/assert/jest';
import { SynthUtils } from "@aws-cdk/assert";

describe('ThumbnailingBucket', () => {
    const stack = new Stack();
    new ThumbnailingBucket(stack, 'Subject', {
        name: "blog-pictures"
    });
    it("defines exactly two buckets", () => {
        expect(stack).toCountResources('AWS::S3::Bucket', 2);
    });
    it("defines exactly two buckets", () => {
        expect(stack).toCountResources('AWS::Lambda::Function', 1+1); // 1 is implicitly created by the notification handler
    });
    it("sets the correct policies", () => {
        expect(SynthUtils.subset(stack, {resourceTypes: ["AWS::IAM::Policy"]})).toMatchSnapshot();
    });
});