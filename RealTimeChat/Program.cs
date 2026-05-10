using RealTimeChat;
using RealTimeChat.Hubs;
using System.Collections.Concurrent;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSignalR();

//builder.Services.AddSingleton<IDictionary<string, UserRoomConnection>>(opts =>
    //new Dictionary<string, UserRoomConnection>());

builder.Services.AddSingleton<ConcurrentDictionary<string, UserRoomConnection>>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseRouting();


app.UseCors("AllowAngular");

app.UseAuthorization();

app.MapControllers();
app.MapHub<ChatHub>("/chat");

app.Run();