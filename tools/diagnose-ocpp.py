"""
Advanced OCPP WebSocket Diagnostic Tool
Tests different connection parameters and shows detailed error info
"""

import asyncio
import websockets
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

async def test_detailed(url, subprotocols=None, extra_headers=None):
    """Test with detailed error logging"""
    print(f"\n{'='*70}")
    print(f"Testing: {url}")
    if subprotocols:
        print(f"Subprotocols: {subprotocols}")
    if extra_headers:
        print(f"Headers: {extra_headers}")
    print('='*70)
    
    try:
        kwargs = {}
        if subprotocols:
            kwargs['subprotocols'] = subprotocols
        if extra_headers:
            kwargs['extra_headers'] = extra_headers
        
        # Add timeout
        kwargs['ping_interval'] = None
        kwargs['close_timeout'] = 5
        
        async with websockets.connect(url, **kwargs) as ws:
            print(f"✓ SUCCESS! Connected!")
            print(f"  Subprotocol selected: {ws.subprotocol}")
            print(f"  Remote address: {ws.remote_address}")
            
            # Try sending a test message
            test_msg = [2, "test-123", "BootNotification", {
                "chargePointVendor": "TestVendor",
                "chargePointModel": "TestModel"
            }]
            
            import json
            await ws.send(json.dumps(test_msg))
            print(f"  ✓ Sent BootNotification")
            
            # Wait for response (with timeout)
            try:
                response = await asyncio.wait_for(ws.recv(), timeout=5.0)
                print(f"  ✓ Received response: {response}")
            except asyncio.TimeoutError:
                print(f"  ⚠ No response within 5 seconds")
            
            return True
            
    except websockets.exceptions.InvalidStatusCode as e:
        print(f"✗ FAILED: HTTP {e.status_code}")
        print(f"  Response headers: {e.headers}")
    except websockets.exceptions.InvalidUpgrade as e:
        print(f"✗ FAILED: Invalid upgrade")
        print(f"  Error: {e}")
    except Exception as e:
        print(f"✗ FAILED: {type(e).__name__}")
        print(f"  Error: {e}")
        import traceback
        traceback.print_exc()
    
    return False

async def main():
    """Run diagnostic tests"""
    
    print("\n" + "="*70)
    print("OCPP WebSocket Detailed Diagnostic")
    print("="*70)
    print("\nBackend confirmed running:")
    print("  - OCPP Service: Port 8080, PID 34232")
    print("  - URL Format: ws://localhost:8080/ocpp/{chargerId}")
    print("="*70)
    
    tests = [
        {
            'name': 'Standard OCPP 1.6',
            'url': 'ws://localhost:8080/ocpp/CHARGER-001',
            'subprotocols': ['ocpp1.6'],
            'headers': None
        },
        {
            'name': 'With User-Agent',
            'url': 'ws://localhost:8080/ocpp/CHARGER-001',
            'subprotocols': ['ocpp1.6'],
            'headers': {'User-Agent': 'OCPP-Simulator/1.0'}
        },
        {
            'name': 'No subprotocol',
            'url': 'ws://localhost:8080/ocpp/CHARGER-001',
            'subprotocols': None,
            'headers': None
        },
        {
            'name': 'Alternative path (no /ocpp)',
            'url': 'ws://localhost:8080/CHARGER-001',
            'subprotocols': ['ocpp1.6'],
            'headers': None
        },
        {
            'name': 'Root path with ID',
            'url': 'ws://localhost:8080/ocpp',
            'subprotocols': ['ocpp1.6'],
            'headers': None
        },
        {
            'name': 'With Origin header',
            'url': 'ws://localhost:8080/ocpp/CHARGER-001',
            'subprotocols': ['ocpp1.6'],
            'headers': {'Origin': 'http://localhost:3001'}
        },
    ]
    
    success = False
    for i, test in enumerate(tests, 1):
        print(f"\n\n📊 Test {i}: {test['name']}")
        result = await test_detailed(
            test['url'],
            test.get('subprotocols'),
            test.get('headers')
        )
        if result:
            success = True
            print(f"\n{'='*70}")
            print(f"✓✓✓ WORKING CONFIGURATION FOUND! ✓✓✓")
            print(f"{'='*70}")
            print(f"URL: {test['url']}")
            print(f"Subprotocols: {test.get('subprotocols')}")
            print(f"Headers: {test.get('headers')}")
            print(f"{'='*70}")
            break
        
        await asyncio.sleep(0.5)
    
    if not success:
        print(f"\n{'='*70}")
        print("❌ ALL TESTS FAILED")
        print("="*70)
        print("\n🔍 Possible Issues:")
        print("1. OCPP service may not be configured correctly")
        print("2. Service might be expecting different WebSocket format")
        print("3. CORS or security settings blocking connection")
        print("4. Service might need specific authentication")
        print("\n💡 Recommendation:")
        print("Contact backend team and ask:")
        print("  - Can you test OCPP connection from backend?")
        print("  - What WebSocket client/tool do you use to test?")
        print("  - Are there any logs showing connection attempts?")
        print("  - Can you share a working connection example?")
        print("="*70)
    
    print("\n\n📝 Backend Service Info:")
    print("  Process ID: 34232")
    print("  Port: 8080")
    print("  Protocol: OCPP 1.6J")
    print("  Confirmed: RUNNING")
    print()

if __name__ == '__main__':
    asyncio.run(main())
