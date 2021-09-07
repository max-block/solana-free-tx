localnet-validator:
	solana-test-validator -r


localnet-airdrop:
	solana airdrop 10 keys/alice.json -u localhost
	solana airdrop 10 keys/bob.json -u localhost


deploy-localnet:
	cd program; cargo build-bpf
	solana program deploy program/target/deploy/program.so -u localhost --program-id keys/program.json


deploy-testnet:
	cd program; cargo build-bpf
	solana program deploy program/target/deploy/program.so -u testnet --program-id keys/program.json --keypair keys/alice.json --upgrade-authority keys/alice.json


browser:
	npm start


