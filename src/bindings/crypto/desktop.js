import crypto from 'crypto'; // resolved to crypto-browserify by vite-plugin-node-polyfills

/**
 * Web/Vite implementation of ICryptoBinding.
 *
 * - randomBytes, createHash, createHmac, createCipheriv, createDecipheriv
 *   are delegated to crypto-browserify (already polyfilled by vite-plugin-node-polyfills).
 *
 * - generateKeyPairSync is NOT supported in the browser. Use generateKeyPair (async)
 *   instead. The sync variant throws a clear error so callers notice immediately
 *   rather than getting a silent undefined.
 *
 * - generateKeyPair uses window.crypto.subtle (natively available in Electron's
 *   Chromium renderer) and returns DER-encoded SPKI/PKCS8 buffers, matching the
 *   output format of Node's generateKeyPairSync with { format: 'der' }.
 *
 * Currently only 'ec' / 'prime256v1' is needed (sensor pairing). Other key types
 * can be added when required.
 */
export class CryptoBinding {

    // -------------------------------------------------------------------------
    // Polyfill-backed methods (crypto-browserify)
    // -------------------------------------------------------------------------

    randomBytes(size) {
        return crypto.randomBytes(size);
    }

    createHash(algorithm) {
        return crypto.createHash(algorithm);
    }

    createHmac(algorithm, key) {
        return crypto.createHmac(algorithm, key);
    }

    createCipheriv(algorithm, key, iv) {
        return crypto.createCipheriv(algorithm, key, iv);
    }

    createDecipheriv(algorithm, key, iv) {
        return crypto.createDecipheriv(algorithm, key, iv);
    }

    // -------------------------------------------------------------------------
    // Key pair generation — WebCrypto (async only in browser)
    // -------------------------------------------------------------------------

    /**
     * Not supported in the browser renderer.
     * Call generateKeyPair() instead and await the result.
     */
    generateKeyPairSync(_type, _options) {
        throw new Error(
            'CryptoBinding: generateKeyPairSync is not available in the browser. ' +
            'Use generateKeyPair() (async) instead.',
        );
    }

    /**
     * Async key pair generation via window.crypto.subtle.
     *
     * Currently supports:
     *   type      : 'ec'
     *   namedCurve: 'prime256v1' (P-256)
     *   encoding  : { format: 'der' } — returns raw DER bytes as Buffer
     *
     * Output is wire-compatible with Node's generateKeyPairSync using the same options.
     */
    async generateKeyPair(type, options) {
        if (type === 'ec') {
            return this._generateEcKeyPair(options);
        }

        throw new Error(`CryptoBinding: generateKeyPair does not yet support key type '${type}'`);
    }

    async _generateEcKeyPair(options) {
        const { namedCurve, publicKeyEncoding, privateKeyEncoding } = options;

        // Map OpenSSL curve names to WebCrypto named curves
        const curveMap = {
            'prime256v1': 'P-256',
            'p-256':      'P-256',
            'secp384r1':  'P-384',
            'p-384':      'P-384',
            'secp521r1':  'P-521',
            'p-521':      'P-521',
        };

        const webCurveName = curveMap[namedCurve?.toLowerCase()];
        if (!webCurveName) {
            throw new Error(`CryptoBinding: unsupported EC curve '${namedCurve}'`);
        }

        if (publicKeyEncoding?.format !== 'der' || privateKeyEncoding?.format !== 'der') {
            throw new Error('CryptoBinding: only { format: "der" } is supported in the browser');
        }

        const subtle = window.crypto.subtle;

        const keyPair = await subtle.generateKey(
            { name: 'ECDH', namedCurve: webCurveName },
            true,       // extractable — required for exportKey
            ['deriveKey', 'deriveBits'],
        );

        // exportKey('spki')  → DER-encoded SubjectPublicKeyInfo  (matches type: 'spki')
        // exportKey('pkcs8') → DER-encoded PrivateKeyInfo        (matches type: 'pkcs8')
        const [publicKeyDer, privateKeyDer] = await Promise.all([
            subtle.exportKey('spki',  keyPair.publicKey),
            subtle.exportKey('pkcs8', keyPair.privateKey),
        ]);

        return {
            publicKey:  Buffer.from(publicKeyDer),
            privateKey: Buffer.from(privateKeyDer),
        };
    }
}

export const getDesktopCryptoBinding = () => new CryptoBinding();