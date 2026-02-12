using Microsoft.AspNetCore.HttpLogging;

var builder = WebApplication.CreateBuilder(args);

// Додаємо контролери
builder.Services.AddControllers();

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

// Тестовий ендпоінт
app.MapGet("/health", () => Results.Ok(new { 
    Status = "Healthy", 
    Node = Environment.GetEnvironmentVariable("NODE_ID") ?? Environment.MachineName,
}));

app.Run();