using Microsoft.EntityFrameworkCore;

public class ReadOnlyDbContext : AppDbContext
{
    // Ми просто передаємо опції в захищений конструктор базового класу
    public ReadOnlyDbContext(DbContextOptions<ReadOnlyDbContext> options) : base(options) { }
}