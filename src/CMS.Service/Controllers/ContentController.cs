using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class ContentController(
    AppDbContext masterDb,
    ReadOnlyDbContext replicaDb,
    ILogger<ContentController> logger) : ControllerBase
{
    private readonly string _nodeName = Environment.MachineName;

    // --- READ (Slave) ---

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ContentItem>>> GetAll()
    {
        logger.LogInformation(">>> [GET ALL] Request handled by Node: {Node} using REPLICA", _nodeName);
        var items = await replicaDb.ContentItems.AsNoTracking().ToListAsync();
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ContentItem>> GetById(int id)
    {
        logger.LogInformation(">>> [GET BY ID] Request handled by Node: {Node} using REPLICA", _nodeName);
        var item = await replicaDb.ContentItems.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);

        if (item == null) return NotFound();
        return Ok(item);
    }

    // --- WRITE (Master) ---

    [HttpPost]
    public async Task<ActionResult<ContentItem>> Create(ContentItem item)
    {
        logger.LogInformation("<<< [CREATE] Request handled by Node: {Node} using MASTER", _nodeName);

        masterDb.ContentItems.Add(item);
        await masterDb.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, ContentItem item)
    {
        if (id != item.Id) return BadRequest();

        logger.LogInformation("<<< [UPDATE] Request handled by Node: {Node} using MASTER", _nodeName);

        masterDb.Entry(item).State = EntityState.Modified;

        try
        {
            await masterDb.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await masterDb.ContentItems.AnyAsync(e => e.Id == id)) return NotFound();
            throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        logger.LogInformation("<<< [DELETE] Request handled by Node: {Node} using MASTER", _nodeName);

        var item = await masterDb.ContentItems.FindAsync(id);
        if (item == null) return NotFound();

        masterDb.ContentItems.Remove(item);
        await masterDb.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/image")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadImage(int id, IFormFile file, [FromServices] IFileService fileService)
    {
        var item = await masterDb.ContentItems.FindAsync(id);
        if (item == null) return NotFound();

        var fileKey = await fileService.UploadFileAsync(file);
        
        // Припустимо, ми додали поле ImageKey в модель ContentItem
        item.Body += $"\n[Image: {fileKey}]"; 
        await masterDb.SaveChangesAsync();

        return Ok(new { FileKey = fileKey });
    }
}