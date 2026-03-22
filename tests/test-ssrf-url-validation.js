const assert = require('assert');
const dnsPromises = require('dns').promises;

const { validateApiUrl } = require('../services/serviceUtils');

const originalResolve4 = dnsPromises.resolve4;
const originalResolve6 = dnsPromises.resolve6;

function createDnsError(code = 'ENOTFOUND') {
  const error = new Error('DNS lookup failed');
  error.code = code;
  return error;
}

async function withMockedDns(mockMap, fn) {
  dnsPromises.resolve4 = async (hostname) => {
    const entry = mockMap[hostname] || {};
    if (entry.resolve4Error) {
      throw entry.resolve4Error;
    }
    if (entry.resolve4) {
      return entry.resolve4;
    }
    throw createDnsError();
  };

  dnsPromises.resolve6 = async (hostname) => {
    const entry = mockMap[hostname] || {};
    if (entry.resolve6Error) {
      throw entry.resolve6Error;
    }
    if (entry.resolve6) {
      return entry.resolve6;
    }
    throw createDnsError('ENODATA');
  };

  try {
    await fn();
  } finally {
    dnsPromises.resolve4 = originalResolve4;
    dnsPromises.resolve6 = originalResolve6;
  }
}

async function main() {
  await withMockedDns(
    {
      'loopback.test': { resolve4: ['127.0.0.1'] },
      'private-ipv4.test': { resolve4: ['192.168.1.23'] },
      'linklocal-ipv6.test': { resolve6: ['fe80::1'] },
      'ula-ipv6.test': { resolve6: ['fc00::1234'] },
      'mixed-answer.test': { resolve4: ['93.184.216.34', '192.168.1.10'] },
      'public-domain.test': { resolve4: ['93.184.216.34'], resolve6: ['2606:2800:220:1:248:1893:25c8:1946'] }
    },
    async () => {
      const loopbackDomain = await validateApiUrl('http://loopback.test/resource', { allowPrivateIPs: false });
      assert.strictEqual(loopbackDomain.valid, false, 'Domain resolving to 127.0.0.1 must be blocked');

      const privateIpv4Domain = await validateApiUrl('http://private-ipv4.test/resource', { allowPrivateIPs: false });
      assert.strictEqual(privateIpv4Domain.valid, false, 'Domain resolving to 192.168.x.x must be blocked');

      const linkLocalIpv6Domain = await validateApiUrl('http://linklocal-ipv6.test/resource', { allowPrivateIPs: false });
      assert.strictEqual(linkLocalIpv6Domain.valid, false, 'Domain resolving to fe80::/10 must be blocked');

      const ulaIpv6Domain = await validateApiUrl('http://ula-ipv6.test/resource', { allowPrivateIPs: false });
      assert.strictEqual(ulaIpv6Domain.valid, false, 'Domain resolving to fc00::/7 must be blocked');

      const mixedResolution = await validateApiUrl('http://mixed-answer.test/resource', { allowPrivateIPs: false });
      assert.strictEqual(mixedResolution.valid, false, 'A single private DNS answer must block the URL');

      const publicDomain = await validateApiUrl('http://public-domain.test/resource', { allowPrivateIPs: false });
      assert.strictEqual(publicDomain.valid, true, 'Public domain must remain allowed');

      const privateAllowed = await validateApiUrl('http://private-ipv4.test/resource', { allowPrivateIPs: true });
      assert.strictEqual(privateAllowed.valid, true, 'Private targets should be allowed when allowPrivateIPs=true');

      const localhostStillBlocked = await validateApiUrl('http://loopback.test/resource', {
        allowPrivateIPs: true,
        allowLocalhost: false
      });
      assert.strictEqual(localhostStillBlocked.valid, false, 'Loopback should remain blocked unless allowLocalhost=true');
    }
  );
}

main()
  .then(() => {
    console.log('[PASS] SSRF validator DNS resolution regressions are covered');
  })
  .catch((error) => {
    console.error('[FAIL] SSRF validator test failed:', error.message);
    process.exitCode = 1;
  });
