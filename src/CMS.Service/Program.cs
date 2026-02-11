using Microsoft.AspNetCore.HttpLogging;

var builder = WebApplication.CreateBuilder(args);

// 1. Додаємо контролери
builder.Services.AddControllers();

// 2. Налаштовуємо Swagger (корисно для тестування мікросервісів)
builder.Services.AddEndpointsApiExplorer();
// builder.Services.AddSwaggerGen();

// 3. Додаємо HttpLogging, щоб бачити вхідні запити в консолі Docker
builder.Services.AddHttpLogging(logging =>
{
    logging.LoggingFields = HttpLoggingFields.All;
});

var app = builder.Build();

// 4. Swagger додамо пізніше
// app.UseSwagger();
// app.UseSwaggerUI();

// 5. HttpLogging Middleware
app.UseHttpLogging();

// 6. Маршрутизація
app.UseAuthorization();
app.MapControllers();

// 7. Тестовий ендпоінт прямо тут (мінімалістичний спосіб перевірки)
app.MapGet("/health", () => Results.Ok(new { 
    Status = "Healthy", 
    Node = Environment.GetEnvironmentVariable("NODE_ID") ?? "Unknown" 
}));

app.Run();