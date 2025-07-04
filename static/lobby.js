class PongLobby {
    constructor() {
        this.socket = io();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Create game button
        document.getElementById('createGameBtn').addEventListener('click', () => {
            this.createGame();
        });
        
        // Join game button
        document.getElementById('joinGameBtn').addEventListener('click', () => {
            this.joinGame();
        });
        
        // Copy link buttons
        document.getElementById('copyLinkBtn').addEventListener('click', () => {
            this.copyToClipboard('shareLink');
        });
        
        // Enter key in game code input
        document.getElementById('gameCodeInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.joinGame();
            }
        });
    }
    
    async createGame() {
        try {
            const response = await fetch('/create-game');
            const data = await response.json();
            
            if (data.game_id) {
                this.showGameLink(data.game_id);
            }
        } catch (error) {
            console.error('Error creating game:', error);
            this.showError('Failed to create game. Please try again.');
        }
    }
    
    joinGame() {
        const gameCode = document.getElementById('gameCodeInput').value.trim().toUpperCase();
        
        if (!gameCode) {
            this.showError('Please enter a game code.');
            return;
        }
        
        if (gameCode.length !== 8) {
            this.showError('Game code must be 8 characters long.');
            return;
        }
        
        // Redirect to game page
        window.location.href = `/join/${gameCode}`;
    }
    
    showGameLink(gameId) {
        const gameLinkDiv = document.getElementById('gameLink');
        const shareLinkInput = document.getElementById('shareLink');
        const fullUrl = `${window.location.origin}/join/${gameId}`;
        
        shareLinkInput.value = fullUrl;
        gameLinkDiv.style.display = 'block';
        
        // Scroll to the link
        gameLinkDiv.scrollIntoView({ behavior: 'smooth' });
    }
    
    async copyToClipboard(elementId) {
        const element = document.getElementById(elementId);
        
        try {
            await navigator.clipboard.writeText(element.value);
            this.showSuccess('Link copied to clipboard!');
        } catch (error) {
            // Fallback for older browsers
            element.select();
            document.execCommand('copy');
            this.showSuccess('Link copied to clipboard!');
        }
    }
    
    showError(message) {
        // Simple error display - you could enhance this with a proper toast/notification system
        alert(message);
    }
    
    showSuccess(message) {
        // Simple success display - you could enhance this with a proper toast/notification system
        alert(message);
    }
}

// Initialize lobby when page loads
document.addEventListener('DOMContentLoaded', () => {
    new PongLobby();
}); 