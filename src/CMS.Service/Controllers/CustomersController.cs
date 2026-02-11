using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly IConfiguration _config;

    public CustomersController(IConfiguration config)
    {
        _config = config;
    }

    [HttpGet("test")]
    public IActionResult GetTest()
    {
        // Читаємо NODE_ID з docker-compose
        var nodeId = _config["NODE_ID"] ?? "Unknown Node";
        return Ok(new { 
            Message = "CMS Service works!", 
            ServedBy = nodeId, 
            Timestamp = DateTime.UtcNow 
        });
    }
}