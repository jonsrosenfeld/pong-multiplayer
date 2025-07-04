class MultiplayerPongGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Game state
        this.gameRunning = false;
        this.leftScore = 0;
        this.rightScore = 0;
        this.playerSide = null; // 'left' or 'right'
        this.opponentConnected = false;
        
        // Paddle properties
        this.paddleWidth = 10;
        this.paddleHeight = 60;
        this.paddleSpeed = 5;
        
        // Ball properties
        this.ballSize = 8;
        this.ballSpeed = 4;
        this.ballSpeedX = 0;
        this.ballSpeedY = 0;
        
        // Network properties
        this.lastUpdateTime = 0;
        this.updateRate = 60; // updates per second
        
        // Initialize game objects
        this.initializeGame();
        
        // Setup networking
        this.setupNetworking();
        
        // Input handling
        this.keys = {};
        this.setupInputHandlers();
        
        // UI elements
        this.setupUI();
        
        // Start game loop
        this.gameLoop();
    }
    
    initializeGame() {
        // Initialize paddles
        this.leftPaddle = {
            x: 20,
            y: this.height / 2 - this.paddleHeight / 2,
            width: this.paddleWidth,
            height: this.paddleHeight,
            speed: this.paddleSpeed
        };
        
        this.rightPaddle = {
            x: this.width - 20 - this.paddleWidth,
            y: this.height / 2 - this.paddleHeight / 2,
            width: this.paddleWidth,
            height: this.paddleHeight,
            speed: this.paddleSpeed
        };
        
        // Initialize ball
        this.resetBall();
    }
    
    setupNetworking() {
        this.socket = io();
        this.gameId = window.GAME_ID;
        
        // Join the game room
        this.socket.emit('join_game', { game_id: this.gameId });
        
        // Socket event handlers
        this.socket.on('player_joined', (data) => {
            console.log('Player joined:', data);
            this.updateConnectionStatus('Connected');
        });
        
        this.socket.on('game_start', (data) => {
            console.log('Game starting:', data);
            this.playerSide = data.left_player === this.socket.id ? 'left' : 'right';
            this.opponentConnected = true;
            this.startGame();
        });
        
        this.socket.on('game_update', (data) => {
            this.handleOpponentUpdate(data);
        });
        
        this.socket.on('player_left', (data) => {
            console.log('Player left:', data);
            this.opponentConnected = false;
            this.gameRunning = false;
            this.showMessage('Opponent disconnected', 'Your opponent has left the game.');
        });
        
        this.socket.on('error', (data) => {
            this.showMessage('Error', data.message);
        });
        
        this.socket.on('connect', () => {
            this.updateConnectionStatus('Connected');
        });
        
        this.socket.on('disconnect', () => {
            this.updateConnectionStatus('Disconnected');
        });
    }
    
    setupInputHandlers() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if (e.code === 'Space' && this.opponentConnected) {
                e.preventDefault();
                this.toggleGame();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    setupUI() {
        // Setup UI elements
        this.gameOverlay = document.getElementById('gameOverlay');
        this.waitingScreen = document.getElementById('waitingScreen');
        this.gameMessage = document.getElementById('gameMessage');
        this.currentGameLink = document.getElementById('currentGameLink');
        this.copyGameLinkBtn = document.getElementById('copyGameLinkBtn');
        this.leaveGameBtn = document.getElementById('leaveGameBtn');
        this.newGameBtn = document.getElementById('newGameBtn');
        
        // Set current game link
        this.currentGameLink.value = window.location.href;
        
        // Copy link button
        this.copyGameLinkBtn.addEventListener('click', () => {
            this.copyToClipboard('currentGameLink');
        });
        
        // Leave game button
        this.leaveGameBtn.addEventListener('click', () => {
            window.location.href = '/';
        });
        
        // New game button
        this.newGameBtn.addEventListener('click', () => {
            window.location.href = '/';
        });
    }
    
    updateConnectionStatus(status) {
        const statusElement = document.getElementById('connectionStatus');
        statusElement.textContent = status;
        statusElement.className = `connection-status ${status.toLowerCase()}`;
    }
    
    startGame() {
        this.gameRunning = true;
        this.hideOverlay();
        this.resetBall();
    }
    
    toggleGame() {
        if (!this.opponentConnected) return;
        
        this.gameRunning = !this.gameRunning;
        if (this.gameRunning) {
            this.resetBall();
        }
    }
    
    resetBall() {
        this.ball = {
            x: this.width / 2,
            y: this.height / 2,
            size: this.ballSize
        };
        
        // Random direction
        const angle = (Math.random() - 0.5) * Math.PI / 2;
        this.ballSpeedX = Math.cos(angle) * this.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
        this.ballSpeedY = Math.sin(angle) * this.ballSpeed;
    }
    
    update() {
        if (!this.gameRunning || !this.opponentConnected) return;
        
        this.updatePaddles();
        this.updateBall();
        this.checkCollisions();
        this.checkScoring();
        this.sendGameUpdate();
    }
    
    updatePaddles() {
        // Only update the player's own paddle
        if (this.playerSide === 'left') {
            if (this.keys['w'] && this.leftPaddle.y > 0) {
                this.leftPaddle.y -= this.leftPaddle.speed;
            }
            if (this.keys['s'] && this.leftPaddle.y < this.height - this.leftPaddle.height) {
                this.leftPaddle.y += this.leftPaddle.speed;
            }
        } else if (this.playerSide === 'right') {
            if (this.keys['arrowup'] && this.rightPaddle.y > 0) {
                this.rightPaddle.y -= this.rightPaddle.speed;
            }
            if (this.keys['arrowdown'] && this.rightPaddle.y < this.height - this.rightPaddle.height) {
                this.rightPaddle.y += this.rightPaddle.speed;
            }
        }
    }
    
    updateBall() {
        this.ball.x += this.ballSpeedX;
        this.ball.y += this.ballSpeedY;
    }
    
    checkCollisions() {
        // Top and bottom walls
        if (this.ball.y <= 0 || this.ball.y >= this.height - this.ball.size) {
            this.ballSpeedY = -this.ballSpeedY;
        }
        
        // Left paddle collision
        if (this.ball.x <= this.leftPaddle.x + this.leftPaddle.width &&
            this.ball.x >= this.leftPaddle.x &&
            this.ball.y >= this.leftPaddle.y &&
            this.ball.y <= this.leftPaddle.y + this.leftPaddle.height) {
            
            this.ballSpeedX = -this.ballSpeedX;
            this.addPaddleSpin(this.leftPaddle);
        }
        
        // Right paddle collision
        if (this.ball.x + this.ball.size >= this.rightPaddle.x &&
            this.ball.x <= this.rightPaddle.x + this.rightPaddle.width &&
            this.ball.y >= this.rightPaddle.y &&
            this.ball.y <= this.rightPaddle.y + this.rightPaddle.height) {
            
            this.ballSpeedX = -this.ballSpeedX;
            this.addPaddleSpin(this.rightPaddle);
        }
    }
    
    addPaddleSpin(paddle) {
        const hitPosition = (this.ball.y - paddle.y) / paddle.height;
        const spin = (hitPosition - 0.5) * 2;
        this.ballSpeedY += spin * 2;
        
        const maxSpeed = 8;
        this.ballSpeedX = Math.max(-maxSpeed, Math.min(maxSpeed, this.ballSpeedX));
        this.ballSpeedY = Math.max(-maxSpeed, Math.min(maxSpeed, this.ballSpeedY));
    }
    
    checkScoring() {
        if (this.ball.x <= 0) {
            this.rightScore++;
            this.updateScoreDisplay();
            this.resetBall();
        }
        
        if (this.ball.x >= this.width) {
            this.leftScore++;
            this.updateScoreDisplay();
            this.resetBall();
        }
    }
    
    updateScoreDisplay() {
        document.getElementById('leftScore').textContent = this.leftScore;
        document.getElementById('rightScore').textContent = this.rightScore;
    }
    
    sendGameUpdate() {
        const now = Date.now();
        if (now - this.lastUpdateTime > 1000 / this.updateRate) {
            this.socket.emit('game_update', {
                game_id: this.gameId,
                ball: this.ball,
                leftPaddle: this.leftPaddle,
                rightPaddle: this.rightPaddle,
                leftScore: this.leftScore,
                rightScore: this.rightScore,
                ballSpeedX: this.ballSpeedX,
                ballSpeedY: this.ballSpeedY
            });
            this.lastUpdateTime = now;
        }
    }
    
    handleOpponentUpdate(data) {
        // Update opponent's paddle and ball position
        if (this.playerSide === 'left') {
            this.rightPaddle = data.rightPaddle;
        } else {
            this.leftPaddle = data.leftPaddle;
        }
        
        // Update ball and scores
        this.ball = data.ball;
        this.ballSpeedX = data.ballSpeedX;
        this.ballSpeedY = data.ballSpeedY;
        this.leftScore = data.leftScore;
        this.rightScore = data.rightScore;
        this.updateScoreDisplay();
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw center line
        this.ctx.strokeStyle = '#fff';
        this.ctx.setLineDash([5, 15]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.width / 2, 0);
        this.ctx.lineTo(this.width / 2, this.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw paddles
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(
            this.leftPaddle.x,
            this.leftPaddle.y,
            this.leftPaddle.width,
            this.leftPaddle.height
        );
        
        this.ctx.fillRect(
            this.rightPaddle.x,
            this.rightPaddle.y,
            this.rightPaddle.width,
            this.rightPaddle.height
        );
        
        // Draw ball
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(
            this.ball.x + this.ball.size / 2,
            this.ball.y + this.ball.size / 2,
            this.ball.size / 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        // Draw overlay if needed
        if (!this.opponentConnected) {
            this.showOverlay();
        }
    }
    
    showOverlay() {
        this.gameOverlay.style.display = 'flex';
        this.waitingScreen.style.display = 'block';
        this.gameMessage.style.display = 'none';
    }
    
    hideOverlay() {
        this.gameOverlay.style.display = 'none';
    }
    
    showMessage(title, text, showButton = false) {
        this.gameOverlay.style.display = 'flex';
        this.waitingScreen.style.display = 'none';
        this.gameMessage.style.display = 'block';
        
        document.getElementById('messageTitle').textContent = title;
        document.getElementById('messageText').textContent = text;
        
        const messageBtn = document.getElementById('messageBtn');
        if (showButton) {
            messageBtn.style.display = 'inline-block';
        } else {
            messageBtn.style.display = 'none';
        }
    }
    
    async copyToClipboard(elementId) {
        const element = document.getElementById(elementId);
        
        try {
            await navigator.clipboard.writeText(element.value);
            alert('Link copied to clipboard!');
        } catch (error) {
            element.select();
            document.execCommand('copy');
            alert('Link copied to clipboard!');
        }
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new MultiplayerPongGame();
}); 