from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
import uuid
import json
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'pong-secret-key-2024'
socketio = SocketIO(app, cors_allowed_origins="*")

# Store active games
active_games = {}
waiting_players = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/create-game')
def create_game():
    game_id = str(uuid.uuid4())[:8]
    active_games[game_id] = {
        'players': [],
        'state': 'waiting',
        'game_data': None
    }
    return jsonify({'game_id': game_id, 'url': f'/join/{game_id}'})

@app.route('/join/<game_id>')
def join_game(game_id):
    if game_id not in active_games:
        return "Game not found", 404
    return render_template('game.html', game_id=game_id)

@socketio.on('join_game')
def handle_join_game(data):
    game_id = data['game_id']
    player_id = request.sid
    
    if game_id not in active_games:
        emit('error', {'message': 'Game not found'})
        return
    
    game = active_games[game_id]
    
    if len(game['players']) >= 2:
        emit('error', {'message': 'Game is full'})
        return
    
    # Add player to game
    player_data = {
        'id': player_id,
        'side': 'left' if len(game['players']) == 0 else 'right'
    }
    game['players'].append(player_data)
    
    # Join room
    join_room(game_id)
    
    # Notify all players in the game
    emit('player_joined', {
        'player_id': player_id,
        'side': player_data['side'],
        'total_players': len(game['players'])
    }, room=game_id)
    
    # If game is full, start it
    if len(game['players']) == 2:
        game['state'] = 'playing'
        emit('game_start', {
            'left_player': game['players'][0]['id'],
            'right_player': game['players'][1]['id']
        }, room=game_id)

@socketio.on('game_update')
def handle_game_update(data):
    game_id = data['game_id']
    if game_id in active_games:
        # Broadcast game state to other player
        emit('game_update', data, room=game_id, include_self=False)

@socketio.on('disconnect')
def handle_disconnect():
    player_id = request.sid
    
    # Find and remove player from games
    for game_id, game in active_games.items():
        game['players'] = [p for p in game['players'] if p['id'] != player_id]
        
        if len(game['players']) == 0:
            # Game is empty, remove it
            del active_games[game_id]
        else:
            # Notify remaining player
            emit('player_left', {'player_id': player_id}, room=game_id)

if __name__ == '__main__':
    print("🎮 Pong Multiplayer Server Starting...")
    print("📡 Server will be available at: http://localhost:5000")
    print("🌐 To play with friends overseas, you'll need to:")
    print("   1. Deploy this server to a cloud service (Heroku, Railway, etc.)")
    print("   2. Or use ngrok: ngrok http 5000")
    
    # Get port from environment variable (for deployment)
    port = int(os.environ.get('PORT', 5000))
    socketio.run(app, debug=False, host='0.0.0.0', port=port) 