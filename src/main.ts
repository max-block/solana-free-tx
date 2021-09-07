import "regenerator-runtime/runtime"
import {Connection, PublicKey, SystemProgram, Transaction, TransactionInstruction,} from "@solana/web3.js"
import Wallet from "@project-serum/sol-wallet-adapter"
import lo from "buffer-layout"
import BN from "bn.js"

declare global {
    interface Window {
        solana: any
    }
}


const connection = new Connection("https://api.testnet.solana.com")

let solletWallet = new Wallet("https://www.sollet.io", null)
solletWallet.on("connect", (publicKey) => console.log("sollet connected", publicKey.toBase58()))

export function connectPhantomWallet() {
    window.solana.on("connect", () => {
        console.log("phantom connected", window.solana.publicKey.toString())
        document.getElementById("connectPhantom").style.display = "none"
        document.getElementById("sendPhantom").style.display = "block"
    })
    window.solana.connect()
}

export async function connectSolletWallet() {
    await solletWallet.connect()
    document.getElementById("connectSollet").style.display = "none"
    document.getElementById("sendSollet").style.display = "block"
}

async function prepareTransaction(userPubkey: PublicKey): Promise<Transaction> {
    const bobPubkey = new PublicKey("Cn4U1Qsh7v8vkFKZ6RHiPw5vecGZmQKhj8rnJRWz5tCm")
    const programId = new PublicKey("EQ7SAEcpvYs2j37c6QeYqJqiuJLh7LsFu9rPHF1raLS8")

    // encode 0.1 SOL as an input_data
    const data = Buffer.alloc(64)
    lo.ns64("value").encode(new BN("100000000"), data)

    const ix = new TransactionInstruction({
        keys: [
            {pubkey: userPubkey, isSigner: true, isWritable: true},
            {pubkey: bobPubkey, isSigner: false, isWritable: true},
            {pubkey: SystemProgram.programId, isSigner: false, isWritable: false},
        ],
        programId: programId,
        data: data,
    })
    let tx = new Transaction()
    tx.add(ix)
    tx.feePayer = userPubkey
    tx.recentBlockhash = (await connection.getRecentBlockhash()).blockhash

    return tx
}

export async function sendViaPhantom() {
    console.log("sendViaPhantom called")
    const tx = await prepareTransaction(window.solana.publicKey)
    let signed = await window.solana.signTransaction(tx)
    const res = await broadcastSignedTransaction(signed)
    document.getElementById("sendPhantom").style.display = "none"
    document.getElementById("resultPhantom").innerText = "tx hash " + res
}

export async function sendViaSollet() {
    console.log("sendViaSollet called")
    const tx = await prepareTransaction(solletWallet.publicKey)
    let signed = await solletWallet.signTransaction(tx)
    const res = await broadcastSignedTransaction(signed)
    document.getElementById("sendSollet").style.display = "none"
    document.getElementById("resultSollet").innerText = "tx hash " + res
}

async function broadcastSignedTransaction(signed) {
    let signature = await connection.sendRawTransaction(signed.serialize())
    console.log("Submitted transaction " + signature + ", awaiting confirmation")
    return signature
}
