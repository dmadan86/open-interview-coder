import express, { Express } from 'express';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// WebSocket connection handling
wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected');
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connection',
    message: 'Connected to server'
  }));

  // Handle incoming messages
  ws.on('message', (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('Received message:', message);

      // Handle different action types
      switch (message.action) {
        case 'screenshot':
          handleScreenshot(ws);
          break;
        case 'process':
          handleProcess(ws);
          break;
        case 'clear':
          handleClear(ws);
          break;
        case 'hide':
          handleHide(ws);
          break;
        case 'show':
          handleShow(ws);
          break;
        default:
          ws.send(JSON.stringify({
            type: 'error',
            message: `Unknown action: ${message.action}`
          }));
      }
    } catch (error) {
      console.error('Error parsing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    console.log('Client disconnected');
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Handler functions
function handleScreenshot(ws: WebSocket) {
  console.log('Taking screenshot...');
  broadcast({
    type: 'take-screenshot',
    action: 'screenshot',
    message: 'Screenshot taken successfully'
  });
}

function handleProcess(ws: WebSocket) {
  console.log('Processing screenshots...');
  broadcast({
    type: 'process-screenshots',
    action: 'process',
    message: 'Screenshots processed successfully'
  });
}

function handleClear(ws: WebSocket) {
  console.log('Clearing screenshots...');
  broadcast({
    type: 'clear-all',
    action: 'clear',
    message: 'Screenshots cleared successfully'
  });
}

function handleHide(ws: WebSocket) {
  console.log('Hiding window...');
  broadcast({
    type: 'hide-window',
    action: 'hide',
    message: 'Window hidden'
  });
}

function handleShow(ws: WebSocket) {
  console.log('Showing window...');
  broadcast({
    type: 'show-window',
    action: 'show',
    message: 'Window shown'
  });
}

// Broadcast message to all connected clients
function broadcast(message: any) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// Export broadcast function for potential use in other modules
export { broadcast };

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});