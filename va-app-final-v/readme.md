_Generate Certificate_
openssl req -new -x509 -key key.pem -out cert.pem -days 365
It generate 2 files cert.pem (certificate) and key.pem (private key)
