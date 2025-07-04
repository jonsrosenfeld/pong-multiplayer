# 🎮 Pong Multiplayer

A real-time multiplayer Pong game that you can play with friends anywhere in the world! Just share a link - no downloads required.

## ✨ Features

- **🌍 Global Multiplayer**: Play with friends anywhere in the world
- **🔗 Simple Sharing**: Just share a link - no client downloads needed
- **⚡ Real-time Gameplay**: Smooth 60 FPS with WebSocket communication
- **📱 Cross-platform**: Works on desktop, tablet, and mobile
- **🎯 Classic Pong**: Modern physics with paddle spin effects
- **🔄 Auto-matchmaking**: Simple lobby system for easy game creation

## 🚀 Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   cd pong-multiplayer
   pip install -r requirements.txt
   ```

2. **Run the server:**
   ```bash
   python server.py
   ```

3. **Open your browser:**
   - Go to `http://localhost:5000`
   - Create a game and share the link with a friend

### Playing with Friends Overseas

To play with friends anywhere in the world, you need to deploy the server:

#### Option 1: Deploy to Railway (Recommended)
1. Create account at [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Railway will automatically detect Python and deploy
4. Share the provided URL with friends

#### Option 2: Deploy to Heroku
1. Create account at [heroku.com](https://heroku.com)
2. Install Heroku CLI
3. Run these commands:
   ```bash
   heroku create your-pong-game
   git add .
   git commit -m "Initial commit"
   git push heroku main
   ```

#### Option 3: Use ngrok (Temporary)
1. Install ngrok: `npm install -g ngrok`
2. Run your local server: `python server.py`
3. In another terminal: `ngrok http 5000`
4. Share the ngrok URL with friends

## 🎮 How to Play

1. **Create a Game:**
   - Click "Create New Game"
   - Copy the generated link
   - Share it with a friend

2. **Join a Game:**
   - Click "Join Game"
   - Enter the 8-character game code
   - Or click a shared link directly

3. **Controls:**
   - **Left Player**: W (up) / S (down)
   - **Right Player**: ↑ (up) / ↓ (down)
   - **Pause/Resume**: SPACE

## 🏗️ Architecture

- **Backend**: Python Flask with Socket.IO
- **Frontend**: HTML5 Canvas + JavaScript
- **Real-time**: WebSocket communication
- **Deployment**: Cloud-ready with minimal dependencies

## 📁 Project Structure

```
pong-multiplayer/
├── server.py              # Main Flask server
├── requirements.txt       # Python dependencies
├── templates/
│   ├── index.html        # Lobby page
│   └── game.html         # Game page
├── static/
│   ├── style.css         # Styling
│   ├── lobby.js          # Lobby functionality
│   └── multiplayer-game.js # Game logic
└── README.md             # This file
```

## 🔧 Configuration

### Environment Variables
- `SECRET_KEY`: Flask secret key (auto-generated)
- `PORT`: Server port (default: 5000)

### Customization
- **Game Speed**: Modify `ballSpeed` in `multiplayer-game.js`
- **Paddle Size**: Change `paddleHeight` and `paddleWidth`
- **Update Rate**: Adjust `updateRate` for network optimization

## 🌐 Deployment Checklist

Before deploying to production:

- [ ] Set `SECRET_KEY` environment variable
- [ ] Configure CORS if needed
- [ ] Set up SSL/HTTPS
- [ ] Configure domain name
- [ ] Set up monitoring/logging
- [ ] Test with multiple players

## 🐛 Troubleshooting

### Common Issues

1. **"Game not found" error:**
   - Game may have expired (games auto-cleanup after inactivity)
   - Create a new game

2. **Connection issues:**
   - Check if server is running
   - Verify firewall settings
   - Try refreshing the page

3. **Lag or stuttering:**
   - Reduce `updateRate` in game settings
   - Check internet connection
   - Close other browser tabs

### Development Tips

- Use browser dev tools to monitor WebSocket connections
- Check server logs for connection issues
- Test with different browsers/devices

## 🤝 Contributing

Feel free to contribute improvements:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source. Feel free to use and modify as needed.

## 🎯 Future Features

- [ ] Multiple game rooms
- [ ] Spectator mode
- [ ] Chat functionality
- [ ] Tournament brackets
- [ ] Custom game settings
- [ ] Mobile touch controls
- [ ] Sound effects
- [ ] Power-ups

---

**Happy Gaming! 🏓** 