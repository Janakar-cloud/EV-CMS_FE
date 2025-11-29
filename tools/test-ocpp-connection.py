"""
Quick WebSocket Test for OCPP Backend
Tests different WebSocket configurations to find what works
"""

import asyncio
import websockets

async def test_connection(url, subprotocols=None):
    """Test WebSocket connection with different configurations"""
    print(f"\n{'='*60}")
    print(f"Testing: {url}")
    if subprotocols:
        print(f"Subprotocols: {subprotocols}")
    print('='*60)
    
    try:
        if subprotocols:
            async with websockets.connect(url, subprotocols=subprotocols) as ws:
                print(f"✓ Connected successfully!")
                print(f"  Selected subprotocol: {ws.subprotocol}")
                return True
        else:
            async with websockets.connect(url) as ws:
                print(f"✓ Connected successfully!")
                return True
    except Exception as e:
        print(f"✗ Connection failed: {e}")
        return False

async def main():
    """Test various configurations"""
    
    tests = [
        # Test 1: Standard ocpp1.6
        {
            'url': 'ws://localhost:8080/ocpp/CHARGER-001',
            'subprotocols': ['ocpp1.6']
        },
        # Test 2: Alternative ocpp16
        {
            'url': 'ws://localhost:8080/ocpp/CHARGER-001',
            'subprotocols': ['ocpp16']
        },
        # Test 3: No subprotocol
        {
            'url': 'ws://localhost:8080/ocpp/CHARGER-001',
            'subprotocols': None
        },
        # Test 4: Multiple subprotocols
        {
            'url': 'ws://localhost:8080/ocpp/CHARGER-001',
            'subprotocols': ['ocpp1.6', 'ocpp16', 'ocpp']
        },
        # Test 5: Just 'ocpp'
        {
            'url': 'ws://localhost:8080/ocpp/CHARGER-001',
            'subprotocols': ['ocpp']
        },
    ]
    
    print("\n" + "="*60)
    print("OCPP WebSocket Connection Tests")
    print("="*60)
    
    for i, test in enumerate(tests, 1):
        print(f"\nTest {i}:")
        await test_connection(test['url'], test.get('subprotocols'))
        await asyncio.sleep(0.5)
    
    print("\n" + "="*60)
    print("Tests Complete")
    print("="*60)

if __name__ == '__main__':
    asyncio.run(main())
