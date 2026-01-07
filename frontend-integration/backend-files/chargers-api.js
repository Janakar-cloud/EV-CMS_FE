/**
 * OCPP Charger API Routes
 * Handles frontend requests to control OCPP simulators
 * 
 * Add this to your backend/api/routes/chargers.js
 */

const express = require('express');
const router = express.Router();
const WebSocket = require('ws');

// Store simulator connections
const simulatorConnections = new Map();

/**
 * GET /api/chargers
 * Get all chargers from simulator
 */
router.get('/', async (req, res) => {
  try {
    const chargers = [
      {
        id: 'CH001',
        name: 'Charger 1',
        status: 'available',
        connectors: 2,
        location: 'Main Station',
        latitude: 28.7041,
        longitude: 77.1025,
        lastHeartbeat: new Date().toISOString()
    // Only return chargers from DB, remove dummy/sample chargers
    res.json({ chargers: [] });
      error: error.message
    });
  }
});

/**
 * GET /api/chargers/:chargerId
 * Get specific charger details
 */
router.get('/:chargerId', async (req, res) => {
  try {
    const { chargerId } = req.params;

    const charger = {
      id: chargerId,
      name: `Charger ${chargerId.replace('CH', '')}`,
      status: 'available',
      connectors: [
        {
          id: 1,
          status: 'available',
          power: '11 kW',
          type: 'Type2'
        },
        {
          id: 2,
          status: 'available',
          power: '22 kW',
          type: 'CCS'
        }
      ],
      lastHeartbeat: new Date().toISOString(),
      firmwareVersion: '2.1.5',
      serialNumber: `CHAR-${chargerId}-2025`
    };

    res.json({
      success: true,
      charger
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/chargers/:chargerId/status
 * Get real-time charger status
 */
router.get('/:chargerId/status', async (req, res) => {
  try {
    const { chargerId } = req.params;

    const status = {
      success: true,
      chargerId,
      status: 'available',
      connectors: [
        {
          id: 1,
          status: 'available',
          transactionId: null,
          connectedVehicle: null,
          meterValue: 0
        },
        {
          id: 2,
          status: 'available',
          transactionId: null,
          connectedVehicle: null,
          meterValue: 0
        }
      ],
      lastUpdate: new Date().toISOString()
    };

    res.json(status);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/chargers/:chargerId/start
 * Start charging session
 */
router.post('/:chargerId/start', async (req, res) => {
  try {
    const { chargerId } = req.params;
    const { connectorId, userId, meterStart } = req.body;

    // Generate transaction ID
    const transactionId = `TXN-${Date.now()}-${chargerId}`;

    // Store transaction in memory (replace with DB in production)
    const transaction = {
      transactionId,
      chargerId,
      connectorId,
      userId,
      meterStart: meterStart || 0,
      startTime: new Date().toISOString(),
      status: 'charging'
    };

    // In production, save to database
    // await Transaction.create(transaction);

    // Send command to OCPP simulator if connected
    sendToSimulator(chargerId, {
      type: 'START_TRANSACTION',
      connectorId,
      userId,
      meterStart
    });

    res.json({
      success: true,
      transactionId,
      chargerId,
      connectorId,
      status: 'charging',
      startTime: transaction.startTime,
      meterStart,
      estimatedCost: '₹12.50/hour'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/chargers/:chargerId/stop
 * Stop charging session
 */
router.post('/:chargerId/stop', async (req, res) => {
  try {
    const { chargerId } = req.params;
    const { connectorId, transactionId, meterStop } = req.body;

    const stopTime = new Date().toISOString();
    const energyDelivered = meterStop || 15.5;
    const costPerKWh = 20; // ₹20 per kWh
    const gst = 0.18;
    
    const baseCost = energyDelivered * costPerKWh;
    const gstAmount = baseCost * gst;
    const totalCost = baseCost + gstAmount;

    // Send command to OCPP simulator if connected
    sendToSimulator(chargerId, {
      type: 'STOP_TRANSACTION',
      connectorId,
      transactionId,
      meterStop
    });

    res.json({
      success: true,
      transactionId,
      chargerId,
      status: 'stopped',
      energyDelivered,
      energyUnit: 'kWh',
      baseCost: baseCost.toFixed(2),
      gst: gstAmount.toFixed(2),
      totalCost: totalCost.toFixed(2),
      costUnit: '₹',
      stopTime
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/chargers/:chargerId/fault
 * Simulate charger fault
 */
router.post('/:chargerId/fault', async (req, res) => {
  try {
    const { chargerId } = req.params;
    const { connectorId, errorCode, severity } = req.body;

    const faultMessages = {
      HighTemperature: 'Charger temperature exceeded safe limits',
      PowerSwitchFailure: 'Power switch malfunction detected',
      PowerSwitchClosed: 'Power switch circuit breaker opened',
      ReaderFailure: 'RFID reader hardware failure',
      EVCommunicationError: 'Lost communication with vehicle',
      GroundFailure: 'Ground fault detection triggered',
      HighVoltage: 'Voltage level out of safe range',
      InternalError: 'Internal firmware error detected'
    };

    // Send fault to simulator
    sendToSimulator(chargerId, {
      type: 'FAULT',
      connectorId,
      errorCode,
      severity
    });

    res.json({
      success: true,
      chargerId,
      connectorId,
      errorCode,
      message: faultMessages[errorCode] || 'Unknown error',
      severity,
      status: 'faulted',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/chargers/:chargerId/remote-command
 * Send remote command to charger
 */
router.post('/:chargerId/remote-command', async (req, res) => {
  try {
    const { chargerId } = req.params;
    const { command, connectorId, params } = req.body;

    const validCommands = [
      'RemoteStartTransaction',
      'RemoteStopTransaction',
      'Reset',
      'UnlockConnector',
      'ChangeConfiguration',
      'GetDiagnostics',
      'TriggerMessage',
      'UpdateFirmware'
    ];

    if (!validCommands.includes(command)) {
      return res.status(400).json({
        success: false,
        error: `Invalid command: ${command}`
      });
    }

    // Send command to simulator
    sendToSimulator(chargerId, {
      type: 'REMOTE_COMMAND',
      command,
      connectorId,
      params
    });

    const commandResults = {
      UnlockConnector: 'Connector unlocked successfully',
      Reset: 'Charger reset initiated',
      RemoteStartTransaction: 'Transaction started remotely',
      RemoteStopTransaction: 'Transaction stopped remotely',
      ChangeConfiguration: 'Configuration updated',
      GetDiagnostics: 'Diagnostics requested',
      TriggerMessage: 'Message triggered',
      UpdateFirmware: 'Firmware update initiated'
    };

    res.json({
      success: true,
      chargerId,
      command,
      status: 'accepted',
      result: commandResults[command] || 'Command executed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Helper function to send commands to simulator
 */
function sendToSimulator(chargerId, message) {
  try {
    // In a real implementation, you would send this via:
    // 1. WebSocket to the OCPP simulator
    // 2. Redis pub/sub
    // 3. Message queue (RabbitMQ, Kafka)
    
    console.log(`[API] Sending to ${chargerId}:`, message);
    
    // Example: Send via WebSocket
    // const ws = simulatorConnections.get(chargerId);
    // if (ws && ws.readyState === WebSocket.OPEN) {
    //   ws.send(JSON.stringify(message));
    // }
  } catch (error) {
    console.error('Error sending to simulator:', error);
  }
}

module.exports = router;
