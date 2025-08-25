# NETS Payment Integration

This document describes the NETS payment integration implemented in the Merchants module.

## Overview

The NETS payment integration follows the standard NETS checkout flow as described in the sequence diagram:

1. **Transaction Request Creation**: Creates a `txnReq` message with payment details
2. **MAC Generation**: Generates a MAC value for security verification
3. **Payment Page**: Embeds the transaction data into an HTML page and opens it in a new window
4. **Payment Processing**: Handles the payment callback and processes the transaction

## Configuration

Update the `NETS_CONFIG` object in `src/modules/Merchants/Merchants.jsx`:

```javascript
const NETS_CONFIG = {
  KEY_ID: 'your_key_id_here',           // Download from NETS Admin Portal
  SECRET_KEY: 'your_secret_key_here',   // Your merchant secret key
  NETS_MID: 'UMID_887770001',           // Your merchant ID
  B2S_TXN_END_URL: 'https://sit2.enets.sg/MerchantApp/sim/b2sTxnEndURL.jsp',
  S2S_TXN_END_URL: 'https://sit2.enets.sg/MerchantApp/rest/s2sTxnEnd',
  // ... other configuration values
};
```

## Implementation Details

### 1. Transaction Request Generation

The `generateTxnReq()` function creates a transaction request with the following structure:

```javascript
{
  "ss": "1",
  "msg": {
    "txnAmount": "1000",                    // Amount in cents
    "merchantTxnRef": "TXN_1234567890",     // Unique transaction reference
    "b2sTxnEndURL": "...",                  // Browser-to-server callback URL
    "s2sTxnEndURL": "...",                  // Server-to-server callback URL
    "netsMid": "UMID_887770001",            // Merchant ID
    "merchantTxnDtm": "2024-01-01 12:00:00", // Transaction timestamp
    // ... other required fields
  }
}
```

### 2. MAC Generation

The `generateMAC()` function creates a HMAC-SHA256 signature:

```javascript
const concatPayloadAndSecretKey = txnReq + NETS_CONFIG.SECRET_KEY;
const hmac = CryptoJS.HmacSHA256(concatPayloadAndSecretKey, NETS_CONFIG.SECRET_KEY);
return CryptoJS.enc.Base64.stringify(hmac);
```

### 3. Payment Flow

1. User clicks "Pay with NETS" button
2. System generates transaction request and MAC value
3. Payment page opens in new window with embedded NETS scripts
4. User completes payment in NETS interface
5. Payment callback processes the result and updates the local system

### 4. Callback Handling

The system listens for NETS payment callbacks and:
- Processes successful payments by deducting from cards
- Creates transaction records with NETS reference
- Updates UI to reflect payment status
- Clears temporary payment data

## Dependencies

- `crypto-js`: For MAC generation (HMAC-SHA256)
- NETS JavaScript SDK: Loaded from NETS servers

## Security Considerations

1. **Secret Key**: Never expose your NETS secret key in client-side code in production
2. **MAC Verification**: Always verify MAC values on the server side
3. **HTTPS**: Use HTTPS for all payment communications
4. **Input Validation**: Validate all payment inputs before processing

## Testing

For testing, use the NETS UAT environment:
- UAT URL: `https://uat2.enets.sg/`
- Test credentials available from NETS

## Production Deployment

Before going live:
1. Update URLs to production NETS endpoints
2. Implement server-side MAC verification
3. Add proper error handling and logging
4. Test with real NETS credentials
5. Implement proper security measures

## Troubleshooting

Common issues:
- **MAC mismatch**: Check secret key and payload format
- **Payment window not opening**: Check popup blockers
- **Callback not working**: Verify message event listeners
- **Transaction not processing**: Check network connectivity and API endpoints




