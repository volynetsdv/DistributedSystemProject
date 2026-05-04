using Amazon.S3;
using Amazon.S3.Util;

public class S3FileService(IAmazonS3 s3Client, IConfiguration config) : IFileService
{
    private readonly string _bucketName = config["S3:BucketName"]!;

    public async Task<string> UploadFileAsync(IFormFile file)
    {
        // Створюємо Bucket, якщо його немає (тільки для розробки)
        if(!await AmazonS3Util.DoesS3BucketExistV2Async(s3Client, _bucketName))
        {
            await s3Client.PutBucketAsync(_bucketName);
            var readOnlyPolicy = $@"{{
                ""Version"": ""2012-10-17"",
                ""Statement"": [
                    {{
                        ""Sid"": ""PublicRead"",
                        ""Effect"": ""Allow"",
                        ""Principal"": ""*"",
                        ""Action"": [""s3:GetObject""],
                        ""Resource"": [""arn:aws:s3:::{_bucketName}/*""]
                    }}
                ]
            }}";
            await s3Client.PutBucketPolicyAsync(new Amazon.S3.Model.PutBucketPolicyRequest
            {
                BucketName = _bucketName,
                Policy = readOnlyPolicy
            });
        }

        var fileKey = $"{Guid.NewGuid()}_{file.FileName}";
        
        using var stream = file.OpenReadStream();
        var putRequest = new Amazon.S3.Model.PutObjectRequest
        {
            BucketName = _bucketName,
            Key = fileKey,
            InputStream = stream,
            ContentType = file.ContentType
        };

        await s3Client.PutObjectAsync(putRequest);

        var requestUrl = $"{config["S3:ServiceURL"]}/{_bucketName}/{fileKey}";
        
        return requestUrl.Replace("http://minio:9000", "http://localhost:9000");
    }
}