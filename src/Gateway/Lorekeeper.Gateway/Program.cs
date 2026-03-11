var builder = WebApplication.CreateBuilder(args);

var corsOriginsRaw = builder.Configuration["CORS_ORIGINS"];
if (!string.IsNullOrWhiteSpace(corsOriginsRaw))
{
    var origins = corsOriginsRaw
        .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

    builder.Services.AddCors(options =>
    {
        options.AddDefaultPolicy(policy =>
        {
            policy.WithOrigins(origins)
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
    });
}

builder.Services.AddReverseProxy().LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

if (!string.IsNullOrWhiteSpace(corsOriginsRaw))
{
    app.UseCors();
}

app.MapReverseProxy();
app.Run();
