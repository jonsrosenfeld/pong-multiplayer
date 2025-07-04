# Deploy Pong Multiplayer

## Quick Deploy to Railway (Easiest)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Pong multiplayer"
   git remote add origin https://github.com/YOUR_USERNAME/pong-multiplayer.git
   git push -u origin main
   ```

2. **Deploy to Railway:**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - Click "New Project" → "Deploy from GitHub"
   - Select your repository
   - Railway auto-deploys and gives you a public URL

3. **Share with friends:**
   - Use the Railway URL (e.g., `https://your-app.railway.app`)
   - Create games and share the generated links
   - Friends can join from anywhere in the world!

## Alternative: Render

1. Go to [render.com](https://render.com)
2. Connect GitHub repository
3. Create Web Service
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `python server.py`

## Test Locally First

```bash
conda activate pong-game
python server.py
# Open http://localhost:5000
``` 