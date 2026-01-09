/**
 * Test Suite: Sensitive Data Protection (SEC-003 Phase 1.3)
 * 
 * Tests for CWE-532 (Information Exposure Through Log Files)
 * Tests for CWE-312 (Cleartext Storage of Sensitive Information)
 * 
 * Validates that sensitive data (passwords, API keys, tokens, secrets)
 * is properly redacted before logging and stored securely.
 */

const { redactSensitiveData, createSafeLogger } = require('../services/serviceUtils');
const config = require('../config/config');

console.log('\n=== SEC-003 Phase 1.3: Sensitive Data Protection Tests ===\n');

// Test 1: Basic sensitive data redaction
console.log('Test 1: Redact password in object');
const testObj1 = {
    username: 'testuser',
    password: 'SuperSecret123!',
    email: 'test@example.com'
};
const redacted1 = redactSensitiveData(testObj1);
if (redacted1.password === '***REDACTED***' && redacted1.username === 'testuser') {
    console.log('✅ PASS: Password redacted, other fields preserved');
} else {
    console.log('❌ FAIL: Expected password=***REDACTED***, username=testuser');
    console.log('   Got:', redacted1);
}

// Test 2: API key redaction
console.log('\nTest 2: Redact API key');
const testObj2 = {
    service: 'openai',
    apiKey: 'sk-1234567890abcdef',
    api_key: 'another-key-format'
};
const redacted2 = redactSensitiveData(testObj2);
if (redacted2.apiKey === '***REDACTED***' && redacted2.api_key === '***REDACTED***') {
    console.log('✅ PASS: Both apiKey and api_key redacted');
} else {
    console.log('❌ FAIL: API keys not properly redacted');
    console.log('   Got:', redacted2);
}

// Test 3: JWT token redaction
console.log('\nTest 3: Redact JWT token');
const testObj3 = {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
    jwt_token: 'another.jwt.token',
    bearerToken: 'Bearer xxx'
};
const redacted3 = redactSensitiveData(testObj3);
if (redacted3.token === '***REDACTED***' && 
    redacted3.jwt_token === '***REDACTED***' &&
    redacted3.bearerToken === '***REDACTED***') {
    console.log('✅ PASS: All token variants redacted');
} else {
    console.log('❌ FAIL: Tokens not properly redacted');
    console.log('   Got:', redacted3);
}

// Test 4: Secret redaction (various formats)
console.log('\nTest 4: Redact secrets');
const testObj4 = {
    clientSecret: 'client-secret-value',
    client_secret: 'another-secret',
    secretKey: 'sk-secret',
    SECRET_VALUE: 'env-secret'
};
const redacted4 = redactSensitiveData(testObj4);
if (redacted4.clientSecret === '***REDACTED***' && 
    redacted4.client_secret === '***REDACTED***' &&
    redacted4.secretKey === '***REDACTED***' &&
    redacted4.SECRET_VALUE === '***REDACTED***') {
    console.log('✅ PASS: All secret variants redacted');
} else {
    console.log('❌ FAIL: Secrets not properly redacted');
    console.log('   Got:', redacted4);
}

// Test 5: Authorization header redaction
console.log('\nTest 5: Redact authorization headers');
const testObj5 = {
    headers: {
        authorization: 'Bearer secret-token',
        Authorization: 'Basic dXNlcjpwYXNz',
        'x-api-key': 'api-key-value'
    }
};
const redacted5 = redactSensitiveData(testObj5);
if (redacted5.headers.authorization === '***REDACTED***' && 
    redacted5.headers.Authorization === '***REDACTED***' &&
    redacted5.headers['x-api-key'] === '***REDACTED***') {
    console.log('✅ PASS: Authorization headers redacted');
} else {
    console.log('❌ FAIL: Headers not properly redacted');
    console.log('   Got:', redacted5);
}

// Test 6: Nested object redaction
console.log('\nTest 6: Redact nested sensitive data');
const testObj6 = {
    config: {
        database: {
            password: 'db-password',
            host: 'localhost'
        },
        api: {
            key: 'api-key-123',
            endpoint: 'https://api.example.com'
        }
    }
};
const redacted6 = redactSensitiveData(testObj6);
if (redacted6.config.database.password === '***REDACTED***' && 
    redacted6.config.database.host === 'localhost' &&
    redacted6.config.api.endpoint === 'https://api.example.com') {
    console.log('✅ PASS: Nested sensitive data redacted, other fields preserved');
} else {
    console.log('❌ FAIL: Nested redaction failed');
    console.log('   Got:', redacted6);
}

// Test 7: Array handling
console.log('\nTest 7: Redact sensitive data in arrays');
const testObj7 = {
    users: [
        { username: 'user1', password: 'pass1' },
        { username: 'user2', password: 'pass2' }
    ]
};
const redacted7 = redactSensitiveData(testObj7);
if (redacted7.users[0].password === '***REDACTED***' && 
    redacted7.users[1].password === '***REDACTED***' &&
    redacted7.users[0].username === 'user1') {
    console.log('✅ PASS: Sensitive data in arrays redacted');
} else {
    console.log('❌ FAIL: Array redaction failed');
    console.log('   Got:', redacted7);
}

// Test 8: Non-sensitive data preservation
console.log('\nTest 8: Preserve non-sensitive data');
const testObj8 = {
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    isActive: true,
    metadata: {
        created: '2024-01-01',
        updated: '2024-01-15'
    }
};
const redacted8 = redactSensitiveData(testObj8);
if (JSON.stringify(redacted8) === JSON.stringify(testObj8)) {
    console.log('✅ PASS: Non-sensitive data unchanged');
} else {
    console.log('❌ FAIL: Non-sensitive data was modified');
    console.log('   Expected:', testObj8);
    console.log('   Got:', redacted8);
}

// Test 9: Safe logger creation
console.log('\nTest 9: Safe logger wraps console methods');
const safeLogger = createSafeLogger();
if (typeof safeLogger.log === 'function' && 
    typeof safeLogger.error === 'function' &&
    typeof safeLogger.warn === 'function') {
    console.log('✅ PASS: Safe logger has required methods');
} else {
    console.log('❌ FAIL: Safe logger missing methods');
}

// Test 10: Cookie security configuration
console.log('\nTest 10: Cookie security settings');
if (config.security && typeof config.security.secureCookies !== 'undefined') {
    console.log('✅ PASS: secureCookies config exists');
    console.log('   Value:', config.security.secureCookies);
    console.log('   (Should be true in production, false in development)');
} else {
    console.log('❌ FAIL: secureCookies config missing');
}

// Test 11: Edge cases - null and undefined
console.log('\nTest 11: Handle null and undefined values');
const testObj11 = {
    password: null,
    apiKey: undefined,
    name: 'test'
};
const redacted11 = redactSensitiveData(testObj11);
if (redacted11.password === '***REDACTED***' && 
    redacted11.apiKey === '***REDACTED***' &&
    redacted11.name === 'test') {
    console.log('✅ PASS: Null and undefined values redacted');
} else {
    console.log('❌ FAIL: Null/undefined handling incorrect');
    console.log('   Got:', redacted11);
}

// Test 12: Case-insensitive matching
console.log('\nTest 12: Case-insensitive key matching');
const testObj12 = {
    PASSWORD: 'upper',
    ApiKey: 'mixed',
    TOKEN: 'upper',
    Secret: 'capitalized'
};
const redacted12 = redactSensitiveData(testObj12);
if (redacted12.PASSWORD === '***REDACTED***' && 
    redacted12.ApiKey === '***REDACTED***' &&
    redacted12.TOKEN === '***REDACTED***' &&
    redacted12.Secret === '***REDACTED***') {
    console.log('✅ PASS: Case-insensitive matching works');
} else {
    console.log('❌ FAIL: Case-insensitive matching failed');
    console.log('   Got:', redacted12);
}

// Test 13: Original object preservation
console.log('\nTest 13: Original object not modified');
const original = {
    password: 'secret123',
    username: 'user'
};
const originalCopy = JSON.parse(JSON.stringify(original));
const redacted13 = redactSensitiveData(original);
if (original.password === originalCopy.password && 
    redacted13.password === '***REDACTED***') {
    console.log('✅ PASS: Original object unchanged (deep copy)');
} else {
    console.log('❌ FAIL: Original object was modified');
    console.log('   Original:', original);
    console.log('   Should be:', originalCopy);
}

// Test 14: Complex nested structure
console.log('\nTest 14: Complex nested structure');
const testObj14 = {
    app: {
        config: {  // Use non-sensitive name instead of 'auth'
            tokenSecret: 'jwt-secret',  // This should be redacted (contains 'secret')
            algorithm: 'HS256',
            provider: {
                clientId: 'public-id',
                clientSecret: 'oauth-secret'
            }
        },
        database: {
            host: 'localhost',
            port: 5432,
            user: 'dbuser',  // Different from 'username' to avoid redaction
            password: 'dbpass'   // Should be redacted
        }
    }
};
const redacted14 = redactSensitiveData(testObj14);
if (redacted14.app.config.tokenSecret === '***REDACTED***' &&
    redacted14.app.config.provider.clientSecret === '***REDACTED***' &&
    redacted14.app.database.password === '***REDACTED***' &&
    redacted14.app.config.algorithm === 'HS256' &&
    redacted14.app.database.host === 'localhost' &&
    redacted14.app.database.user === 'dbuser') {
    console.log('✅ PASS: Complex nested redaction successful');
} else {
    console.log('❌ FAIL: Complex nested redaction failed');
    console.log('   Got:', JSON.stringify(redacted14, null, 2));
}

// Test 15: Performance test (large object)
console.log('\nTest 15: Performance test with large object');
const largeObj = {
    items: []
};
for (let i = 0; i < 1000; i++) {
    largeObj.items.push({
        id: i,
        name: `Item ${i}`,
        password: `pass${i}`,
        apiKey: `key${i}`,
        metadata: {
            created: new Date().toISOString(),
            secret: `secret${i}`
        }
    });
}
const startTime = Date.now();
const redactedLarge = redactSensitiveData(largeObj);
const duration = Date.now() - startTime;
if (duration < 1000 && 
    redactedLarge.items[0].password === '***REDACTED***' &&
    redactedLarge.items[999].apiKey === '***REDACTED***') {
    console.log(`✅ PASS: Large object redacted in ${duration}ms`);
} else {
    console.log(`❌ FAIL: Performance issue or incorrect redaction (took ${duration}ms)`);
}

console.log('\n=== Sensitive Data Protection Tests Complete ===\n');
console.log('Summary:');
console.log('- Sensitive keys: password, apiKey, token, secret, authorization');
console.log('- Redaction: Deep copy with recursive traversal');
console.log('- Cookie security: Configurable via SECURE_COOKIES env var');
console.log('- Logger: Automatic redaction in all console methods');
console.log('');
console.log('For production deployment:');
console.log('- Set NODE_ENV=production for automatic secure cookies');
console.log('- Or explicitly set SECURE_COOKIES=yes in .env');
console.log('- Ensure HTTPS is configured for secure cookie transmission');
console.log('');
