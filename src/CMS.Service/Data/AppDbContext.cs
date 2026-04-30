using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    
    protected AppDbContext(DbContextOptions options) : base(options) { }

    public DbSet<ContentItem> ContentItems => Set<ContentItem>();
}