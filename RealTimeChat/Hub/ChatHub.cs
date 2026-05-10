using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace RealTimeChat.Hubs
{
    public class ChatHub : Hub
    {
        private readonly ConcurrentDictionary<string, UserRoomConnection> _connections;

        private const string SystemUser = "System";

        public ChatHub(ConcurrentDictionary<string, UserRoomConnection> connections)
        {
            _connections = connections;
        }

        // JOIN ROOM
        public async Task JoinRoom(UserRoomConnection userConnection)
        {
            if (string.IsNullOrWhiteSpace(userConnection.User) ||
                string.IsNullOrWhiteSpace(userConnection.Room))
            {
                return;
            }

            userConnection.User = userConnection.User.Trim();
            userConnection.Room = userConnection.Room.Trim();

            // Save connection (stable by ConnectionId)
            _connections[Context.ConnectionId] = userConnection;

            // Add to group
            await Groups.AddToGroupAsync(Context.ConnectionId, userConnection.Room);

            Console.WriteLine($"JOIN: {userConnection.User} -> {userConnection.Room}");

            // Notify room
            await Clients.Group(userConnection.Room)
                .SendAsync(
                    "ReceiveMessage",
                    SystemUser,
                    $"{userConnection.User} joined the room",
                    DateTime.Now
                );

            await SendConnectedUsers(userConnection.Room);
        }

        // SEND MESSAGE (FIXED & SAFE)
        public async Task SendMessage(string message)
        {
            if (string.IsNullOrWhiteSpace(message))
                return;

            if (_connections.TryGetValue(Context.ConnectionId, out var userConnection))
            {
                Console.WriteLine($"MESSAGE: {userConnection.User} -> {message}");

                await Clients.Group(userConnection.Room!)
                    .SendAsync(
                        "ReceiveMessage",
                        userConnection.User,
                        message.Trim(),
                        DateTime.Now
                    );
            }
            else
            {
                Console.WriteLine("ERROR: Connection not found");
            }
        }

        // DISCONNECT
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            if (_connections.TryGetValue(Context.ConnectionId, out var userConnection))
            {
                _connections.TryRemove(Context.ConnectionId, out _);

                await Clients.Group(userConnection.Room!)
                    .SendAsync(
                        "ReceiveMessage",
                        SystemUser,
                        $"{userConnection.User} left the room",
                        DateTime.Now
                    );

                await SendConnectedUsers(userConnection.Room!);
            }

            await base.OnDisconnectedAsync(exception);
        }

        // USERS LIST
        private Task SendConnectedUsers(string room)
        {
            var users = _connections.Values
                .Where(u => u.Room == room && !string.IsNullOrWhiteSpace(u.User))
                .Select(u => u.User)
                .Distinct()
                .ToList();

            return Clients.Group(room)
                .SendAsync("ConnectedUser", users);
        }
    }
}