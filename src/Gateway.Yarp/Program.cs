using Microsoft.AspNetCore.HttpLogging;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpLogging(logging =>
{
    logging.LoggingFields = HttpLoggingFields.All;
});


builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));
var app = builder.Build();

app.UseHttpLogging();

// Для React
app.UseDefaultFiles();
app.UseStaticFiles();

// Маршрутизація YARP
app.UseRouting();
app.MapReverseProxy();

// Fallback для React Router
app.MapFallbackToFile("index.html");

app.Run();
