import crypto from 'crypto';

async function hash(password: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const salt = crypto.randomBytes(8).toString('hex');

        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) return reject(err);
            resolve(`${salt}:${derivedKey.toString('hex')}`);
        });
    });
}

async function verify(password: string, hash: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        const [salt, key] = hash.split(':');
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) return reject(err);
            resolve(key == derivedKey.toString('hex'));
        });
    });
}

export { hash, verify };
