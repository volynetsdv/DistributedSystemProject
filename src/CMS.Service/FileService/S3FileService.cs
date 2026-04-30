using Amazon.S3;
using Amazon.S3.Util;

public class S3FileService(IAmazonS3 s3Client, IConfiguration config) : IFileService
{
    private readonly string _bucketName = config["S3:BucketName"]!;

    public async Task<string> UploadFileAsync(IFormFile file)
    {
        // Створюємо Bucket, якщо його немає (тільки для розробки)
        if(!await AmazonS3Util.DoesS3BucketExistV2Async(s3Client, _bucketName))
            await s3Client.PutBucketAsync(_bucketName);

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
        
        // Повертаємо шлях до файлу (для локальної розробки це буде внутрішня адреса)
        return fileKey;
    }
}