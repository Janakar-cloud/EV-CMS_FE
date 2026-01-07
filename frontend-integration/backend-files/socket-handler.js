/**
 * Socket.IO Real-Time Updates Handler
 * Handles WebSocket connections for live meter updates and charger events
 * 
 * Add this to your backend/api/middleware/socket-handler.js
 */

const io = require('socket.io');

/**
 * Initialize Socket.IO
 * @param {http.Server} httpServer - Express HTTP server
 * @returns {io.Server} Socket.IO server instance
 */
function initializeSocket(httpServer) {
  const socketIO = io(httpServer, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
  });

  // Track connected clients
  const connectedClients = new Map();

  socketIO.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Store client info
    connectedClients.set(socket.id, {
      id: socket.id,
      connectedAt: new Date(),
      watchingChargers: []
    });

    /**
     * Watch specific charger for real-time updates
     */
    socket.on('watch-charger', (chargerId) => {
      console.log(`[Socket] Client ${socket.id} watching charger ${chargerId}`);
      
      const client = connectedClients.get(socket.id);
      if (!client.watchingChargers.includes(chargerId)) {
        client.watchingChargers.push(chargerId);
      }

      // Join room for this charger
      socket.join(`charger-${chargerId}`);

      // Send initial status
      socket.emit('charger-status', {
        chargerId,
        status: 'connected',
        timestamp: new Date().toISOString()
      });
    });

    /**
     * Unwatch charger
     */
    socket.on('unwatch-charger', (chargerId) => {
      console.log(`[Socket] Client ${socket.id} unwatching charger ${chargerId}`);
      
      const client = connectedClients.get(socket.id);
      const index = client.watchingChargers.indexOf(chargerId);
      if (index > -1) {
        client.watchingChargers.splice(index, 1);
      }

      socket.leave(`charger-${chargerId}`);
    });

    /**
     * Watch all chargers
     */
    socket.on('watch-all', () => {
      console.log(`[Socket] Client ${socket.id} watching all chargers`);
      
      socket.join('all-chargers');

      socket.emit('all-chargers-connected', {
        message: 'Connected to all chargers',
        timestamp: new Date().toISOString()
      });
    });

    /**
     * Get live charger status
     */
    socket.on('get-charger-status', (chargerId, callback) => {
      const status = {
        chargerId,
        status: 'available',
        connectors: [
          { id: 1, status: 'available' },
          { id: 2, status: 'available' }
        ],
        timestamp: new Date().toISOString()
      };

      if (callback) {
        callback(status);
      }
    });

    /**
     * Disconnect handler
     */
    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
      connectedClients.delete(socket.id);
    });

    /**
     * Error handler
     */
    socket.on('error', (error) => {
      console.error(`[Socket] Error from ${socket.id}:`, error);
    });
  });

  return socketIO;
}

/**
 * Broadcast meter values to connected clients
 * Call this from your OCPP simulator handler when meter values are received
 * 
 * Usage: broadcastMeterValues(io, 'CH001', meterData)
 */
function broadcastMeterValues(socketIO, chargerId, meterData) {
  const payload = {
    event: 'meterValues',
    chargerId,
    connectorId: meterData.connectorId,
    transactionId: meterData.transactionId,
    voltage: meterData.voltage || 230,
    current: meterData.current || 16,
    power: parseFloat((meterData.current * meterData.voltage / 1000).toFixed(2)),
    powerUnit: 'kW',
    energy: meterData.energy || 0,
    energyUnit: 'kWh',
    cost: Math.round(meterData.energy * 20 * 1.18), // ₹20/kWh with 18% GST
    costUnit: '₹',
    timestamp: new Date().toISOString()
  };

  // Broadcast to all clients watching this charger
  socketIO.to(`charger-${chargerId}`).emit('meterValues', payload);

  // Also broadcast to "all chargers" watchers
  socketIO.to('all-chargers').emit('meterValues', payload);
}

/**
 * Broadcast charger status change
 * Call when charger status changes
 */
function broadcastChargerStatus(socketIO, chargerId, status, connectorId) {
  const payload = {
    event: 'chargerStatus',
    chargerId,
    status,
    connectorId,
    timestamp: new Date().toISOString()
  };

  socketIO.to(`charger-${chargerId}`).emit('chargerStatus', payload);
  socketIO.to('all-chargers').emit('chargerStatus', payload);
}

/**
 * Broadcast transaction update
 */
function broadcastTransactionUpdate(socketIO, chargerId, transactionData) {
  const payload = {
    event: 'transactionUpdate',
    chargerId,
    transactionId: transactionData.transactionId,
    status: transactionData.status,
    energy: transactionData.energy || 0,
    cost: transactionData.cost || 0,
    timestamp: new Date().toISOString()
  };

  socketIO.to(`charger-${chargerId}`).emit('transactionUpdate', payload);
  socketIO.to('all-chargers').emit('transactionUpdate', payload);
}

/**
 * Broadcast fault/error
 */
function broadcastFault(socketIO, chargerId, faultData) {
  const payload = {
    event: 'chargerFault',
    chargerId,
    connectorId: faultData.connectorId,
    errorCode: faultData.errorCode,
    message: faultData.message,
    severity: faultData.severity,
    timestamp: new Date().toISOString()
  };

  socketIO.to(`charger-${chargerId}`).emit('chargerFault', payload);
  socketIO.to('all-chargers').emit('chargerFault', payload);
}

/**
 * Broadcast remote command result
 */
function broadcastRemoteCommandResult(socketIO, chargerId, commandResult) {
  const payload = {
    event: 'remoteCommandResult',
    chargerId,
    command: commandResult.command,
    status: commandResult.status,
    result: commandResult.result,
    timestamp: new Date().toISOString()
  };

  socketIO.to(`charger-${chargerId}`).emit('remoteCommandResult', payload);
  socketIO.to('all-chargers').emit('remoteCommandResult', payload);
}

/**
 * Get connected client count
 */
function getConnectedClients(socketIO) {
  return socketIO.engine.clientsCount;
}

module.exports = {
  initializeSocket,
  broadcastMeterValues,
  broadcastChargerStatus,
  broadcastTransactionUpdate,
  broadcastFault,
  broadcastRemoteCommandResult,
  getConnectedClients
};
