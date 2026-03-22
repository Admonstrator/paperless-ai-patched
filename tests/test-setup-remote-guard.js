/**
 * Unit tests for the setup remote-access guard (GHSA-v4jq-65q5-wgjp)
 *
 * Tests both the isLocalRequest() helper logic and the setupRemoteAccessGuard
 * middleware behaviour. No running server required — all tests use mock
 * request/response/next objects.
 *
 * Usage:
 *   node tests/test-setup-remote-guard.js
 */

'use strict';

// ---------------------------------------------------------------------------
// Replica of the production isLocalRequest() helper
// (mirrors the implementation in routes/setup.js exactly)
// ---------------------------------------------------------------------------

function isLocalRequest(req) {
  const remoteAddr = req.socket?.remoteAddress;
  if (!remoteAddr) {
    return false;
  }

  return (
    remoteAddr === '127.0.0.1' ||
    remoteAddr === '::1' ||
    remoteAddr === '::ffff:127.0.0.1'
  );
}

// ---------------------------------------------------------------------------
// Minimal mock helpers
// ---------------------------------------------------------------------------

function makeReq({ remoteAddress, path = '/api/setup/complete' } = {}) {
  return {
    socket: remoteAddress !== undefined ? { remoteAddress } : undefined,
    path
  };
}

function makeRes() {
  const res = {
    _status: null,
    _body: null,
    _type: null,
    statusCode: null,
    status(code) {
      this._status = code;
      this.statusCode = code;
      return this;
    },
    json(body) {
      this._body = body;
      this._type = 'json';
      return this;
    },
    type(t) {
      this._contentType = t;
      return this;
    },
    send(body) {
      this._body = body;
      this._type = 'html';
      return this;
    }
  };

  return res;
}

function makeNext() {
  let called = false;
  const fn = () => {
    called = true;
  };

  fn.wasCalled = () => called;
  return fn;
}

// ---------------------------------------------------------------------------
// Replica of the setupRemoteAccessGuard middleware logic for isolated testing
// ---------------------------------------------------------------------------

async function setupRemoteAccessGuardTestable(req, res, next, { setupOpen, allowRemote }) {
  const isSetupPath =
    req.path === '/setup' ||
    req.path.startsWith('/setup/') ||
    req.path.startsWith('/api/setup');

  if (!isSetupPath) {
    return next();
  }

  if (!setupOpen) {
    return next();
  }

  if (allowRemote) {
    return next();
  }

  if (isLocalRequest(req)) {
    return next();
  }

  const isApiPath = req.path.startsWith('/api/setup');
  if (isApiPath) {
    return res.status(403).json({
      success: false,
      error: 'Remote access to the setup API is disabled.'
    });
  }

  return res
    .status(403)
    .type('text/html')
    .send('<h1>403</h1>');
}

// ---------------------------------------------------------------------------
// Test runner
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;

function assert(label, condition) {
  if (condition) {
    console.log(`  ✅ PASS: ${label}`);
    passed += 1;
  } else {
    console.error(`  ❌ FAIL: ${label}`);
    failed += 1;
  }
}

// ---------------------------------------------------------------------------
// Part 1: isLocalRequest() unit tests
// ---------------------------------------------------------------------------

console.log('\n🧪 Part 1: isLocalRequest() — IP classification');
console.log('='.repeat(60));

assert('IPv4 loopback 127.0.0.1 → local', isLocalRequest(makeReq({ remoteAddress: '127.0.0.1' })));
assert('IPv6 loopback ::1 → local', isLocalRequest(makeReq({ remoteAddress: '::1' })));
assert('IPv4-mapped IPv6 ::ffff:127.0.0.1 → local', isLocalRequest(makeReq({ remoteAddress: '::ffff:127.0.0.1' })));

assert('Private RFC-1918 192.168.1.100 → remote', !isLocalRequest(makeReq({ remoteAddress: '192.168.1.100' })));
assert('Docker bridge 172.17.0.1 → remote', !isLocalRequest(makeReq({ remoteAddress: '172.17.0.1' })));
assert('IPv4-mapped Docker 172.17.0.1 → remote', !isLocalRequest(makeReq({ remoteAddress: '::ffff:172.17.0.1' })));
assert('Public IP 1.2.3.4 → remote', !isLocalRequest(makeReq({ remoteAddress: '1.2.3.4' })));
assert('undefined socket → not local (fail-safe)', !isLocalRequest({ socket: undefined }));
assert('null remoteAddress → not local (fail-safe)', !isLocalRequest({ socket: { remoteAddress: null } }));
assert('empty string remoteAddress → not local', !isLocalRequest({ socket: { remoteAddress: '' } }));

// ---------------------------------------------------------------------------
// Part 2: setupRemoteAccessGuard() middleware behaviour
// ---------------------------------------------------------------------------

console.log('\n🧪 Part 2: setupRemoteAccessGuard() — middleware behaviour');
console.log('='.repeat(60));

(async () => {
  // ── Test group: non-setup paths always pass through ───────────────────────
  {
    const next = makeNext();
    const res = makeRes();
    await setupRemoteAccessGuardTestable(
      makeReq({ remoteAddress: '8.8.8.8', path: '/dashboard' }),
      res, next,
      { setupOpen: true, allowRemote: false }
    );
    assert('Non-setup path /dashboard → next() called regardless', next.wasCalled());
    assert('Non-setup path /dashboard → no 403 emitted', res._status === null);
  }

  {
    const next = makeNext();
    const res = makeRes();
    await setupRemoteAccessGuardTestable(
      makeReq({ remoteAddress: '8.8.8.8', path: '/api/processing-status' }),
      res, next,
      { setupOpen: true, allowRemote: false }
    );
    assert('Non-setup path /api/processing-status → next() called', next.wasCalled());
  }

  // ── Test group: setup already complete ────────────────────────────────────
  {
    const next = makeNext();
    const res = makeRes();
    await setupRemoteAccessGuardTestable(
      makeReq({ remoteAddress: '8.8.8.8', path: '/api/setup/complete' }),
      res, next,
      { setupOpen: false, allowRemote: false }
    );
    assert('Setup closed + remote IP → next() (guard lifted)', next.wasCalled());
    assert('Setup closed + remote IP → no 403', res._status === null);
  }

  // ── Test group: setup open, ALLOW_REMOTE_SETUP=yes ───────────────────────
  {
    const next = makeNext();
    const res = makeRes();
    await setupRemoteAccessGuardTestable(
      makeReq({ remoteAddress: '8.8.8.8', path: '/api/setup/complete' }),
      res, next,
      { setupOpen: true, allowRemote: true }
    );
    assert('Setup open + remote IP + allowRemote=yes → next()', next.wasCalled());
    assert('Setup open + remote IP + allowRemote=yes → no 403', res._status === null);
  }

  // ── Test group: setup open, localhost ─────────────────────────────────────
  {
    const next = makeNext();
    const res = makeRes();
    await setupRemoteAccessGuardTestable(
      makeReq({ remoteAddress: '127.0.0.1', path: '/api/setup/complete' }),
      res, next,
      { setupOpen: true, allowRemote: false }
    );
    assert('Setup open + 127.0.0.1 → next() (localhost allowed)', next.wasCalled());
    assert('Setup open + 127.0.0.1 → no 403', res._status === null);
  }

  {
    const next = makeNext();
    const res = makeRes();
    await setupRemoteAccessGuardTestable(
      makeReq({ remoteAddress: '::1', path: '/api/setup/presets' }),
      res, next,
      { setupOpen: true, allowRemote: false }
    );
    assert('Setup open + ::1 → next() (IPv6 localhost allowed)', next.wasCalled());
  }

  // ── Test group: setup open, remote IP, no opt-in → 403 ───────────────────
  {
    const next = makeNext();
    const res = makeRes();
    await setupRemoteAccessGuardTestable(
      makeReq({ remoteAddress: '8.8.8.8', path: '/api/setup/complete' }),
      res, next,
      { setupOpen: true, allowRemote: false }
    );
    assert('Setup open + remote IP + no opt-in + /api/setup/* → 403', res._status === 403);
    assert('Setup open + remote IP + no opt-in + /api/setup/* → JSON body', res._type === 'json');
    assert('Setup open + remote IP + no opt-in + /api/setup/* → next() NOT called', !next.wasCalled());
    assert('Setup open + remote IP → success=false in body', res._body?.success === false);
  }

  {
    const next = makeNext();
    const res = makeRes();
    await setupRemoteAccessGuardTestable(
      makeReq({ remoteAddress: '172.17.0.1', path: '/setup' }),
      res, next,
      { setupOpen: true, allowRemote: false }
    );
    assert('Setup open + Docker-bridge IP + GET /setup → 403', res._status === 403);
    assert('Setup open + Docker-bridge IP + GET /setup → HTML response', res._type === 'html');
    assert('Setup open + Docker-bridge IP + GET /setup → next() NOT called', !next.wasCalled());
  }

  {
    const next = makeNext();
    const res = makeRes();
    await setupRemoteAccessGuardTestable(
      makeReq({ remoteAddress: '10.0.0.1', path: '/api/setup/paperless/test' }),
      res, next,
      { setupOpen: true, allowRemote: false }
    );
    assert('Setup open + private IP 10.x + /api/setup/* → 403 JSON', res._status === 403);
    assert('Setup open + private IP 10.x + /api/setup/* → JSON type', res._type === 'json');
  }

  // ── Test group: edge cases ─────────────────────────────────────────────────
  {
    const next = makeNext();
    const res = makeRes();
    await setupRemoteAccessGuardTestable(
      makeReq({ remoteAddress: '::ffff:127.0.0.1', path: '/api/setup/mfa/setup' }),
      res, next,
      { setupOpen: true, allowRemote: false }
    );
    assert('Setup open + ::ffff:127.0.0.1 → next() (IPv4-mapped loopback)', next.wasCalled());
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(60));
  console.log(`Results: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    console.error('\n❌ Some tests FAILED.');
    process.exit(1);
  } else {
    console.log('\n✅ All tests PASSED.');
  }
})();
