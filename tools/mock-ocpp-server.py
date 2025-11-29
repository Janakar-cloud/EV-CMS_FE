#!/usr/bin/env python3
"""
Mock OCPP Central System Server
--------------------------------
A simple OCPP 1.6 Central System server for testing charge point simulators.

Requirements:
    pip install websockets

Usage:
    python mock-ocpp-server.py

Features:
    - Accepts OCPP 1.6 WebSocket connections
    - Responds to Boot Notification, Heartbeat, Status Notifications
    - Handles Start/Stop Transaction
    - Accepts all authorization requests
    - Logs all OCPP messages
"""

import asyncio
import websockets
import json
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Store connected charge points
connected_chargers = {}
active_transactions = {}
transaction_counter = 1000


async def handle_charge_point(websocket):
    """Handle OCPP messages from a charge point"""
    
    # Extract charge point ID from path
    path = websocket.request.path if hasattr(websocket, 'request') else websocket.path
    charge_point_id = path.strip('/').split('/')[-1]
    
    if not charge_point_id:
        charge_point_id = "UNKNOWN"
    
    connected_chargers[charge_point_id] = websocket
    logger.info(f"{'='*60}")
    logger.info(f"✓ Charge Point Connected: {charge_point_id}")
    logger.info(f"  Connection from: {websocket.remote_address}")
    logger.info(f"{'='*60}")
    
    try:
        async for message in websocket:
            # Parse OCPP message
            data = json.loads(message)
            
            # OCPP message format: [MessageTypeId, MessageId, Action, Payload]
            msg_type = data[0]
            msg_id = data[1]
            
            if msg_type == 2:  # CALL
                action = data[2]
                payload = data[3] if len(data) > 3 else {}
                
                logger.info(f"← [{charge_point_id}] {action}")
                logger.debug(f"   Payload: {payload}")
                
                # Handle different OCPP actions
                response = None
                
                if action == "BootNotification":
                    response = handle_boot_notification(msg_id, payload)
                    logger.info(f"   Model: {payload.get('chargePointModel', 'Unknown')}")
                    logger.info(f"   Vendor: {payload.get('chargePointVendor', 'Unknown')}")
                
                elif action == "Heartbeat":
                    response = handle_heartbeat(msg_id)
                
                elif action == "StatusNotification":
                    response = handle_status_notification(msg_id, payload)
                    logger.info(f"   Status: {payload.get('status', 'Unknown')}")
                    logger.info(f"   Connector: {payload.get('connectorId', 0)}")
                
                elif action == "Authorize":
                    response = handle_authorize(msg_id, payload)
                    logger.info(f"   ID Tag: {payload.get('idTag', 'Unknown')}")
                
                elif action == "StartTransaction":
                    response = handle_start_transaction(msg_id, payload, charge_point_id)
                    logger.info(f"   ID Tag: {payload.get('idTag', 'Unknown')}")
                    logger.info(f"   Connector: {payload.get('connectorId', 0)}")
                    logger.info(f"   Meter Start: {payload.get('meterStart', 0)} Wh")
                
                elif action == "StopTransaction":
                    response = handle_stop_transaction(msg_id, payload)
                    logger.info(f"   Transaction ID: {payload.get('transactionId', 0)}")
                    logger.info(f"   Meter Stop: {payload.get('meterStop', 0)} Wh")
                
                elif action == "MeterValues":
                    response = handle_meter_values(msg_id, payload)
                    meter_value = payload.get('meterValue', [{}])[0].get('sampledValue', [{}])[0].get('value', 0)
                    logger.info(f"   Meter Value: {meter_value} Wh")
                
                elif action == "DataTransfer":
                    response = handle_data_transfer(msg_id, payload)
                
                else:
                    # Unknown action - send generic acceptance
                    logger.warning(f"   Unknown action: {action}")
                    response = [3, msg_id, {"status": "Accepted"}]
                
                # Send response
                if response:
                    await websocket.send(json.dumps(response))
                    logger.info(f"→ [{charge_point_id}] Response sent")
            
            elif msg_type == 3:  # CALLRESULT
                logger.info(f"← [{charge_point_id}] CALLRESULT")
            
            elif msg_type == 4:  # CALLERROR
                logger.error(f"← [{charge_point_id}] CALLERROR: {data}")
    
    except websockets.exceptions.ConnectionClosed:
        logger.info(f"✗ Connection closed: {charge_point_id}")
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {e}")
    except Exception as e:
        logger.error(f"Error handling message: {e}")
    finally:
        # Clean up
        if charge_point_id in connected_chargers:
            del connected_chargers[charge_point_id]
        logger.info(f"{'='*60}")
        logger.info(f"Charge Point Disconnected: {charge_point_id}")
        logger.info(f"{'='*60}")


def handle_boot_notification(msg_id, payload):
    """Handle Boot Notification"""
    return [
        3,  # CALLRESULT
        msg_id,
        {
            "status": "Accepted",
            "currentTime": datetime.utcnow().isoformat() + "Z",
            "interval": 30  # Heartbeat interval in seconds
        }
    ]


def handle_heartbeat(msg_id):
    """Handle Heartbeat"""
    return [
        3,
        msg_id,
        {
            "currentTime": datetime.utcnow().isoformat() + "Z"
        }
    ]


def handle_status_notification(msg_id, payload):
    """Handle Status Notification"""
    return [3, msg_id, {}]


def handle_authorize(msg_id, payload):
    """Handle Authorization - Accept all"""
    return [
        3,
        msg_id,
        {
            "idTagInfo": {
                "status": "Accepted",
                "expiryDate": "2030-12-31T23:59:59Z"
            }
        }
    ]


def handle_start_transaction(msg_id, payload, charge_point_id):
    """Handle Start Transaction"""
    global transaction_counter
    
    transaction_id = transaction_counter
    transaction_counter += 1
    
    # Store transaction
    active_transactions[transaction_id] = {
        "chargePointId": charge_point_id,
        "connectorId": payload.get("connectorId", 1),
        "idTag": payload.get("idTag", ""),
        "startTime": datetime.utcnow(),
        "meterStart": payload.get("meterStart", 0)
    }
    
    logger.info(f"   ⚡ Transaction Started: ID={transaction_id}")
    
    return [
        3,
        msg_id,
        {
            "transactionId": transaction_id,
            "idTagInfo": {
                "status": "Accepted"
            }
        }
    ]


def handle_stop_transaction(msg_id, payload):
    """Handle Stop Transaction"""
    transaction_id = payload.get("transactionId", 0)
    
    if transaction_id in active_transactions:
        transaction = active_transactions[transaction_id]
        meter_start = transaction["meterStart"]
        meter_stop = payload.get("meterStop", 0)
        energy_consumed = meter_stop - meter_start
        
        logger.info(f"   ⚡ Transaction Stopped: ID={transaction_id}")
        logger.info(f"   Energy Consumed: {energy_consumed} Wh")
        
        # Remove transaction
        del active_transactions[transaction_id]
    
    return [
        3,
        msg_id,
        {
            "idTagInfo": {
                "status": "Accepted"
            }
        }
    ]


def handle_meter_values(msg_id, payload):
    """Handle Meter Values"""
    return [3, msg_id, {}]


def handle_data_transfer(msg_id, payload):
    """Handle Data Transfer"""
    return [
        3,
        msg_id,
        {
            "status": "Accepted"
        }
    ]


async def send_remote_command(charge_point_id, action, payload):
    """Send a remote command to a charge point"""
    if charge_point_id not in connected_chargers:
        logger.error(f"Charge point {charge_point_id} not connected")
        return None
    
    ws = connected_chargers[charge_point_id]
    msg_id = str(int(datetime.utcnow().timestamp() * 1000))
    
    message = [2, msg_id, action, payload]
    
    try:
        await ws.send(json.dumps(message))
        logger.info(f"→ [{charge_point_id}] {action} command sent")
        return msg_id
    except Exception as e:
        logger.error(f"Error sending command: {e}")
        return None


async def main():
    """Start the OCPP Central System server"""
    
    print("=" * 70)
    print(" Mock OCPP 1.6 Central System Server")
    print("=" * 70)
    print()
    print(" Server Configuration:")
    print("   - Host: localhost")
    print("   - Port: 3001")
    print("   - Protocol: OCPP 1.6 (WebSocket)")
    print("   - Subprotocol: ocpp1.6")
    print()
    print(" WebSocket URL:")
    print("   ws://localhost:3001/ocpp/{ChargePointId}")
    print()
    print(" Example:")
    print("   ws://localhost:3001/ocpp/TEST-CP-001")
    print()
    print("=" * 70)
    print(" Server Status: RUNNING")
    print(" Press Ctrl+C to stop")
    print("=" * 70)
    print()
    
    try:
        async with websockets.serve(
            handle_charge_point,
            "localhost",
            3001,
            subprotocols=['ocpp1.6'],
            ping_interval=30,
            ping_timeout=10
        ):
            await asyncio.Future()  # Run forever
    except KeyboardInterrupt:
        print("\n" + "=" * 70)
        print(" Server stopped by user")
        print("=" * 70)
    except Exception as e:
        logger.error(f"Server error: {e}")


if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
