#!/usr/bin/env python3
"""
OCPP 1.6 Charge Point Simulator
-------------------------------
A simple OCPP 1.6 charge point simulator for testing the Brand Admin dashboard.

Requirements:
    pip install ocpp websockets

Usage:
    python ocpp-simulator.py --id CP-001 --url ws://localhost:3001/ocpp

Features:
    - Boot Notification
    - Heartbeat (every 30 seconds)
    - Status Notifications
    - Start/Stop Transaction
    - Meter Values
    - Responds to Remote Start/Stop commands
"""

import asyncio
import websockets
import argparse
import logging
from datetime import datetime
from ocpp.v16 import ChargePoint as cp
from ocpp.v16 import call, call_result
from ocpp.v16.enums import (
    Action,
    ChargePointStatus,
    RegistrationStatus,
    RemoteStartStopStatus,
)
from ocpp.routing import on

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ChargePointSimulator(cp):
    """OCPP 1.6 Charge Point Simulator"""
    
    def __init__(self, id, connection, response_timeout=30):
        super().__init__(id, connection, response_timeout)
        self.transaction_id = None
        self.current_status = ChargePointStatus.available
        self.meter_value = 0.0
        self.id_tag = None
        
    # ==================== Outgoing Messages ====================
    
    async def send_boot_notification(self):
        """Send Boot Notification to Central System"""
        logger.info("Sending Boot Notification...")
        request = call.BootNotification(
            charge_point_model="Simulator-v1.0",
            charge_point_vendor="EV-CMS Test Vendor",
            charge_point_serial_number=f"SIM-{self.id}",
            firmware_version="1.0.0",
        )
        
        try:
            response = await self.call(request)
            
            if response.status == RegistrationStatus.accepted:
                logger.info(f"✓ Boot Notification ACCEPTED")
                logger.info(f"  Heartbeat Interval: {response.interval}s")
                return response.interval
            else:
                logger.warning(f"✗ Boot Notification {response.status}")
                return None
        except Exception as e:
            logger.error(f"Boot Notification failed: {e}")
            return None
    
    async def send_heartbeat(self, interval=30):
        """Send periodic heartbeats"""
        logger.info(f"Starting Heartbeat (every {interval}s)...")
        
        while True:
            try:
                request = call.Heartbeat()
                response = await self.call(request)
                logger.info(f"♥ Heartbeat - Server Time: {response.current_time}")
            except Exception as e:
                logger.error(f"Heartbeat failed: {e}")
            
            await asyncio.sleep(interval)
    
    async def send_status_notification(self, connector_id=1, status=None):
        """Send Status Notification"""
        if status:
            self.current_status = status
            
        logger.info(f"Sending Status Notification: {self.current_status}")
        request = call.StatusNotification(
            connector_id=connector_id,
            error_code="NoError",
            status=self.current_status,
        )
        
        try:
            response = await self.call(request)
            logger.info(f"✓ Status Updated: {self.current_status}")
        except Exception as e:
            logger.error(f"Status Notification failed: {e}")
    
    async def send_authorize(self, id_tag):
        """Send Authorization request"""
        logger.info(f"Authorizing ID Tag: {id_tag}")
        request = call.Authorize(id_tag=id_tag)
        
        try:
            response = await self.call(request)
            logger.info(f"✓ Authorization: {response.id_tag_info['status']}")
            return response.id_tag_info['status'] == 'Accepted'
        except Exception as e:
            logger.error(f"Authorization failed: {e}")
            return False
    
    async def send_start_transaction(self, connector_id=1, id_tag="USER-001"):
        """Start a charging transaction"""
        logger.info(f"Starting Transaction - ID Tag: {id_tag}")
        
        # Update status to preparing
        await self.send_status_notification(
            connector_id=connector_id,
            status=ChargePointStatus.preparing
        )
        
        request = call.StartTransaction(
            connector_id=connector_id,
            id_tag=id_tag,
            meter_start=int(self.meter_value),
            timestamp=datetime.utcnow().isoformat(),
        )
        
        try:
            response = await self.call(request)
            self.transaction_id = response.transaction_id
            self.id_tag = id_tag
            self.current_status = ChargePointStatus.charging
            
            logger.info(f"✓ Transaction Started - ID: {self.transaction_id}")
            
            # Update status to charging
            await self.send_status_notification(
                connector_id=connector_id,
                status=ChargePointStatus.charging
            )
            
            return self.transaction_id
        except Exception as e:
            logger.error(f"Start Transaction failed: {e}")
            return None
    
    async def send_stop_transaction(self, reason="Local"):
        """Stop the charging transaction"""
        if not self.transaction_id:
            logger.warning("No active transaction to stop")
            return
        
        logger.info(f"Stopping Transaction - ID: {self.transaction_id}")
        
        request = call.StopTransaction(
            meter_stop=int(self.meter_value),
            timestamp=datetime.utcnow().isoformat(),
            transaction_id=self.transaction_id,
            reason=reason,
            id_tag=self.id_tag,
        )
        
        try:
            response = await self.call(request)
            logger.info(f"✓ Transaction Stopped - Total Energy: {self.meter_value} Wh")
            
            # Update status to available
            await self.send_status_notification(status=ChargePointStatus.available)
            
            # Reset transaction data
            self.transaction_id = None
            self.id_tag = None
            self.meter_value = 0.0
        except Exception as e:
            logger.error(f"Stop Transaction failed: {e}")
    
    async def send_meter_values(self):
        """Send periodic meter values during charging"""
        logger.info("Starting Meter Values reporting...")
        
        while True:
            await asyncio.sleep(60)  # Every 60 seconds
            
            if self.transaction_id and self.current_status == ChargePointStatus.charging:
                # Simulate energy consumption (7.4 kW charging)
                self.meter_value += 7400  # Wh per minute
                
                request = call.MeterValues(
                    connector_id=1,
                    meter_value=[{
                        'timestamp': datetime.utcnow().isoformat(),
                        'sampled_value': [{
                            'value': str(int(self.meter_value)),
                            'unit': 'Wh',
                            'measurand': 'Energy.Active.Import.Register',
                        }]
                    }],
                    transaction_id=self.transaction_id,
                )
                
                try:
                    response = await self.call(request)
                    logger.info(f"⚡ Meter Value: {self.meter_value} Wh")
                except Exception as e:
                    logger.error(f"Meter Values failed: {e}")
    
    # ==================== Incoming Messages (Handlers) ====================
    
    @on('RemoteStartTransaction')
    async def on_remote_start_transaction(self, id_tag, connector_id=1, **kwargs):
        """Handle Remote Start Transaction command"""
        logger.info(f"📥 Remote Start Transaction - ID Tag: {id_tag}, Connector: {connector_id}")
        
        # Start transaction
        transaction_id = await self.send_start_transaction(
            connector_id=connector_id,
            id_tag=id_tag
        )
        
        if transaction_id:
            return call_result.RemoteStartTransaction(
                status=RemoteStartStopStatus.accepted
            )
        else:
            return call_result.RemoteStartTransaction(
                status=RemoteStartStopStatus.rejected
            )
    
    @on('RemoteStopTransaction')
    async def on_remote_stop_transaction(self, transaction_id, **kwargs):
        """Handle Remote Stop Transaction command"""
        logger.info(f"📥 Remote Stop Transaction - ID: {transaction_id}")
        
        if self.transaction_id == transaction_id:
            await self.send_stop_transaction(reason="Remote")
            return call_result.RemoteStopTransaction(
                status=RemoteStartStopStatus.accepted
            )
        else:
            logger.warning(f"Transaction ID mismatch: {transaction_id} != {self.transaction_id}")
            return call_result.RemoteStopTransaction(
                status=RemoteStartStopStatus.rejected
            )
    
    @on('Reset')
    async def on_reset(self, type, **kwargs):
        """Handle Reset command"""
        logger.info(f"📥 Reset Command - Type: {type}")
        
        # Stop any active transaction
        if self.transaction_id:
            await self.send_stop_transaction(reason="Reboot")
        
        # Send status notification
        await self.send_status_notification(status=ChargePointStatus.unavailable)
        
        # Simulate reset delay
        await asyncio.sleep(2)
        
        # Back online
        await self.send_status_notification(status=ChargePointStatus.available)
        
        return call_result.Reset(status="Accepted")
    
    @on('UnlockConnector')
    async def on_unlock_connector(self, connector_id, **kwargs):
        """Handle Unlock Connector command"""
        logger.info(f"📥 Unlock Connector - ID: {connector_id}")
        
        # Simulate unlocking
        return call_result.UnlockConnector(status="Unlocked")
    
    @on('GetConfiguration')
    async def on_get_configuration(self, key=None, **kwargs):
        """Handle Get Configuration command"""
        logger.info(f"📥 Get Configuration - Keys: {key}")
        
        # Return sample configuration
        config = {
            "configurationKey": [
                {"key": "HeartbeatInterval", "readonly": False, "value": "30"},
                {"key": "MeterValueSampleInterval", "readonly": False, "value": "60"},
                {"key": "NumberOfConnectors", "readonly": True, "value": "1"},
            ]
        }
        
        return call_result.GetConfiguration(**config)
    
    @on('ChangeConfiguration')
    async def on_change_configuration(self, key, value, **kwargs):
        """Handle Change Configuration command"""
        logger.info(f"📥 Change Configuration - {key}={value}")
        
        return call_result.ChangeConfiguration(status="Accepted")


async def main():
    """Main function to run the simulator"""
    parser = argparse.ArgumentParser(description='OCPP 1.6 Charge Point Simulator')
    parser.add_argument('--id', default='TEST-CP-001', help='Charge Point ID')
    parser.add_argument('--url', default='ws://localhost:3001/ocpp', help='Central System WebSocket URL')
    parser.add_argument('--autostart', action='store_true', help='Automatically start a transaction')
    args = parser.parse_args()
    
    charge_point_id = args.id
    url = args.url  # Don't append charger ID - it goes in BootNotification payload
    
    logger.info("=" * 60)
    logger.info("OCPP 1.6 Charge Point Simulator")
    logger.info("=" * 60)
    logger.info(f"Charge Point ID: {charge_point_id}")
    logger.info(f"Central System URL: {url}")
    logger.info("=" * 60)
    
    try:
        async with websockets.connect(
            url,
            subprotocols=['ocpp1.6'],
            ping_interval=None,  # Disable ping/pong
            close_timeout=10
        ) as ws:
            charge_point = ChargePointSimulator(charge_point_id, ws)
            
            # Send Boot Notification
            heartbeat_interval = await charge_point.send_boot_notification()
            
            if heartbeat_interval is None:
                heartbeat_interval = 30
            
            # Send initial status
            await charge_point.send_status_notification()
            
            # Start background tasks
            tasks = [
                asyncio.ensure_future(charge_point.start()),
                asyncio.ensure_future(charge_point.send_heartbeat(heartbeat_interval)),
                asyncio.ensure_future(charge_point.send_meter_values()),
            ]
            
            # Auto-start transaction if requested
            if args.autostart:
                await asyncio.sleep(5)
                await charge_point.send_start_transaction()
            
            await asyncio.gather(*tasks)
            
    except ConnectionRefusedError:
        logger.error("❌ Connection refused. Is the OCPP server running?")
        logger.info("💡 Make sure your server is running at: ws://localhost:3001/ocpp")
        logger.info("💡 Start your dev server with: npm run dev")
    except websockets.exceptions.InvalidStatusCode as e:
        logger.error(f"❌ Invalid status code: {e.status_code}")
        logger.info("💡 Check if the WebSocket endpoint is correct")
    except websockets.exceptions.WebSocketException as e:
        logger.error(f"WebSocket connection failed: {e}")
    except KeyboardInterrupt:
        logger.info("\nSimulator stopped by user")
    except Exception as e:
        logger.error(f"Simulator error: {e}")


if __name__ == '__main__':
    asyncio.run(main())
