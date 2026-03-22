import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

const packageName = process.env.ANDROID_PACKAGE_NAME || (dryRun ? 'com.huroof.abdo' : '');
const sha256 = process.env.ANDROID_SHA256_FINGERPRINT || (dryRun ? 'AA:BB:CC:DD:EE:FF:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:11:22:33:44:55:66:77:88:99:AA:BB' : '');

if (!packageName || !sha256) {
  console.error('Missing required env vars.');
  console.error('Set ANDROID_PACKAGE_NAME and ANDROID_SHA256_FINGERPRINT, then run again.');
  console.error('Example:');
  console.error('ANDROID_PACKAGE_NAME=com.huroof.abdo ANDROID_SHA256_FINGERPRINT=AA:BB:... npm run android:assetlinks');
  process.exit(1);
}

const normalizedFingerprint = sha256.replace(/\s+/g, '').toUpperCase();

const payload = [
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: packageName,
      sha256_cert_fingerprints: [normalizedFingerprint],
    },
  },
];

const outPath = path.join(process.cwd(), 'public', '.well-known', 'assetlinks.json');
const data = JSON.stringify(payload, null, 2) + '\n';

if (dryRun) {
  console.log('Dry run (no file written):');
  console.log(data);
  process.exit(0);
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, data, 'utf8');

console.log(`assetlinks.json written to: ${outPath}`);
