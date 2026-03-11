using Lorekeeper.World.Application.Features.Worlds.Queries;
using Lorekeeper.World.Application.Interfaces;
using Lorekeeper.World.Infrastructure.Data;
using Lorekeeper.World.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;

var builder = WebApplication.CreateBuilder(args);

static string? BuildConnectionString(IConfiguration config)
{
    var direct = config.GetConnectionString("DefaultConnection");
    if (!string.IsNullOrWhiteSpace(direct)) return direct;

    var databaseUrl = config["DATABASE_URL"];
    if (string.IsNullOrWhiteSpace(databaseUrl)) return null;

    if (!Uri.TryCreate(databaseUrl, UriKind.Absolute, out var uri)) return databaseUrl;

    var userInfo = uri.UserInfo.Split(':', 2);
    var username = Uri.UnescapeDataString(userInfo[0]);
    var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
    var database = uri.AbsolutePath.TrimStart('/');

    var sslMode = "Require";
    if (!string.IsNullOrWhiteSpace(uri.Query))
    {
        var parts = uri.Query.TrimStart('?').Split('&', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        foreach (var part in parts)
        {
            var kv = part.Split('=', 2);
            if (kv.Length == 2 && kv[0].Equals("sslmode", StringComparison.OrdinalIgnoreCase))
            {
                sslMode = kv[1] switch
                {
                    "disable" => "Disable",
                    "prefer" => "Prefer",
                    "allow" => "Allow",
                    "require" => "Require",
                    "verify-ca" => "VerifyCA",
                    "verify-full" => "VerifyFull",
                    _ => "Require",
                };
                break;
            }
        }
    }

    return $"Host={uri.Host};Port={uri.Port};Database={database};Username={username};Password={password};SslMode={sslMode};Trust Server Certificate=true";
}

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
var worldConnectionString = BuildConnectionString(builder.Configuration);
if (string.IsNullOrWhiteSpace(worldConnectionString))
{
    throw new InvalidOperationException("Missing database connection string.");
}

builder.Services.AddDbContext<WorldDbContext>(options =>
    options.UseNpgsql(worldConnectionString)
);
builder.Services.AddScoped<IWorldRepository, WorldRepository>();
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(GetWorldsByUserHandler).Assembly)
);
builder.Services.AddControllers();
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapControllers();

app.Run();
