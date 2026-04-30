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

// Додаємо контролери
builder.Services.AddControllers();

// Реєструємо клієнт для MinIO (S3-сумісне сховище)
var s3Options = builder.Configuration.GetSection("S3");
builder.Services.AddSingleton<IAmazonS3>(sp => {
    var config = new AmazonS3Config {
        ServiceURL = s3Options["ServiceURL"],
        ForcePathStyle = bool.Parse(s3Options["ForcePathStyle"] ?? "true")
    };
    return new AmazonS3Client(s3Options["AccessKey"], s3Options["SecretKey"], config);
});

// Налаштовуємо Swagger (корисно для тестування мікросервісів)
builder.Services.AddEndpointsApiExplorer();
// builder.Services.AddSwaggerGen();

// Додаємо HttpLogging, щоб бачити вхідні запити в консолі Docker
builder.Services.AddHttpLogging(logging =>
{
    logging.LoggingFields = HttpLoggingFields.All;
});
// Для хмари
if (string.IsNullOrEmpty(builder.Configuration["NODE_ID"]))
{
    builder.Configuration["NODE_ID"] = Environment.MachineName;
}

var app = builder.Build();

// Swagger додамо пізніше
// app.UseSwagger();
// app.UseSwaggerUI();

// HttpLogging Middleware
app.UseHttpLogging();

// Маршрутизація
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    
    int retryCount = 0;
    bool dbReady = false;

    var randomDelay = new Random().Next(3000, 10000);
    await Task.Delay(randomDelay).WaitAsync(new CancellationToken());

    while (!dbReady && retryCount < 10) // 10 спроб
    {
        try
        {
            await context.Database.MigrateAsync();
            dbReady = true;
            logger.LogInformation("--> Database is ready and migrated!");
        }
        catch (Exception)
        {
            retryCount++;
            logger.LogWarning("--> Database not ready yet. Retrying in 5s... (Attempt {Count})", retryCount);
            await Task.Delay(5000);
        }
    }
}

// Тестовий ендпоінт
// app.MapGet("/health", () => Results.Ok(new { 
//     Status = "Healthy", 
//     Node = Environment.GetEnvironmentVariable("NODE_ID") ?? Environment.MachineName,
// }));

app.Run();