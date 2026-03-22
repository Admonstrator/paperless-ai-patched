const assert = require('assert');
const dnsPromises = require('dns').promises;

const config = require('../config/config');

const externalApiServiceModulePath = require.resolve('../services/externalApiService');
const axiosModulePath = require.resolve('axios');

const originalResolve4 = dnsPromises.resolve4;
const originalResolve6 = dnsPromises.resolve6;
const originalExternalApiConfig = config.externalApiConfig;
const originalAllowPrivateIps = process.env.EXTERNAL_API_ALLOW_PRIVATE_IPS;
const originalAxiosExport = require.cache[axiosModulePath]?.exports;

function createDnsError(code = 'ENOTFOUND') {
  const error = new Error('DNS lookup failed');
  error.code = code;
  return error;
}

function setDnsMocks(mockMap) {
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
}

function loadExternalApiServiceWithAxiosMock(axiosMock) {
  delete require.cache[externalApiServiceModulePath];
  delete require.cache[axiosModulePath];
  require.cache[axiosModulePath] = {
    id: axiosModulePath,
    filename: axiosModulePath,
    loaded: true,
    exports: axiosMock
  };
  return require('../services/externalApiService');
}

async function main() {
  let axiosCallCount = 0;

  const axiosMock = async (options) => {
    axiosCallCount += 1;
    return {
      status: 200,
      data: {
        ok: true,
        url: options.url
      }
    };
  };

  try {
    process.env.EXTERNAL_API_ALLOW_PRIVATE_IPS = 'no';

    setDnsMocks({
      'blocked-dns.test': { resolve4: ['127.0.0.1'] },
      'public-dns.test': { resolve4: ['93.184.216.34'] }
    });

    config.externalApiConfig = {
      enabled: 'yes',
      url: 'http://blocked-dns.test/data',
      method: 'GET',
      headers: {},
      body: {},
      timeout: 1000
    };

    const serviceForBlockedCase = loadExternalApiServiceWithAxiosMock(axiosMock);
    const blockedResult = await serviceForBlockedCase.fetchData();

    assert.strictEqual(blockedResult, null, 'Blocked DNS target must return null');
    assert.strictEqual(axiosCallCount, 0, 'No outbound request should be sent for blocked DNS targets');

    config.externalApiConfig = {
      enabled: 'yes',
      url: 'http://public-dns.test/data',
      method: 'GET',
      headers: {},
      body: {},
      timeout: 1000
    };

    const serviceForPublicCase = loadExternalApiServiceWithAxiosMock(axiosMock);
    const publicResult = await serviceForPublicCase.fetchData();

    assert.deepStrictEqual(
      publicResult,
      { ok: true, url: 'http://public-dns.test/data' },
      'Public DNS target should remain allowed and return response data'
    );
    assert.strictEqual(axiosCallCount, 1, 'Exactly one outbound request should be sent for the allowed target');
  } finally {
    dnsPromises.resolve4 = originalResolve4;
    dnsPromises.resolve6 = originalResolve6;

    config.externalApiConfig = originalExternalApiConfig;

    if (typeof originalAllowPrivateIps === 'undefined') {
      delete process.env.EXTERNAL_API_ALLOW_PRIVATE_IPS;
    } else {
      process.env.EXTERNAL_API_ALLOW_PRIVATE_IPS = originalAllowPrivateIps;
    }

    delete require.cache[externalApiServiceModulePath];
    delete require.cache[axiosModulePath];

    if (typeof originalAxiosExport !== 'undefined') {
      require.cache[axiosModulePath] = {
        id: axiosModulePath,
        filename: axiosModulePath,
        loaded: true,
        exports: originalAxiosExport
      };
    }
  }
}

main()
  .then(() => {
    console.log('[PASS] External API SSRF DNS blocking behaves correctly');
  })
  .catch((error) => {
    console.error('[FAIL] External API SSRF test failed:', error.message);
    process.exitCode = 1;
  });
