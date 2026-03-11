using MediatR;
using Lorekeeper.Auth.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Lorekeeper.Auth.Infrastructure.Repositories;
using Lorekeeper.Auth.Infrastructure.Services;
using Lorekeeper.Auth.Application.Interfaces;
using Lorekeeper.Auth.Application.Features.Auth.Commands.Register;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

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

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
var authConnectionString = BuildConnectionString(builder.Configuration);
if (string.IsNullOrWhiteSpace(authConnectionString))
{
    throw new InvalidOperationException("Missing database connection string.");
}

builder.Services.AddDbContext<AuthDbContext>(options =>
    options.UseNpgsql(authConnectionString));
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IAuthService, JwtService>();
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(RegisterHandler).Assembly));
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"])),
        };
    });
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
