using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

public class AzureBlobFileService(IConfiguration config) : IFileService
{
    private readonly string _connectionString = config["Azure:BlobStorage:ConnectionString"]!;
    private readonly string _containerName = config["Azure:BlobStorage:ContainerName"] ?? "cms-media";

    public async Task<string> UploadFileAsync(IFormFile file)
    {
        var containerClient = new BlobContainerClient(_connectionString, _containerName);
        await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);

        var blobName = $"{Guid.NewGuid()}_{file.FileName}";
        var blobClient = containerClient.GetBlobClient(blobName);

        using var stream = file.OpenReadStream();
        await blobClient.UploadAsync(stream, new BlobHttpHeaders { ContentType = file.ContentType });

        // Повертаємо повну публічну URL-адресу блоба
        return blobClient.Uri.ToString();
    }
}
