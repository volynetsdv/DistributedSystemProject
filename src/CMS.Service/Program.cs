using Amazon.S3;
using Microsoft.AspNetCore.HttpLogging;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Реєстрація Master (для запису)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("MasterDb")));

// Реєстрація спеціального інтерфейсу для читання
builder.Services.AddDbContext<ReadOnlyDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("ReplicaDb")));

// Реєстрація сервісу для роботи з файлами:
// - Azure Blob Storage (для Azure / production)
// - MinIO S3 (для локальної розробки через docker-compose)
var azureBlobConnectionString = builder.Configuration["Azure:BlobStorage:ConnectionString"];
if (!string.IsNullOrEmpty(azureBlobConnectionString))
{
    builder.Services.AddSingleton<IFileService, AzureBlobFileService>();
}
else
{
    var s3Options = builder.Configuration.GetSection("S3");
    builder.Services.AddSingleton<IAmazonS3>(_ => new AmazonS3Client(
        s3Options["AccessKey"],
        s3Options["SecretKey"],
        new AmazonS3Config
        {
            ServiceURL = s3Options["ServiceURL"],
            ForcePathStyle = bool.Parse(s3Options["ForcePathStyle"] ?? "true")
        }));
    builder.Services.AddSingleton<IFileService, S3FileService>();
}

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddHttpLogging(logging =>
{
    logging.LoggingFields = HttpLoggingFields.All;
});

if (string.IsNullOrEmpty(builder.Configuration["NODE_ID"]))
{
    builder.Configuration["NODE_ID"] = Environment.MachineName;
}

var app = builder.Build();

app.UseHttpLogging();
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    var randomDelay = new Random().Next(3000, 10000);
    await Task.Delay(randomDelay);

    int retryCount = 0;
    while (retryCount < 10)
    {
        try
        {
            await context.Database.MigrateAsync();
            logger.LogInformation("--> Database is ready and migrated!");
            break;
        }
        catch (Exception)
        {
            retryCount++;
            logger.LogWarning("--> Database not ready yet. Retrying in 5s... (Attempt {Count})", retryCount);
            await Task.Delay(5000);
        }
    }
}

app.Run();
