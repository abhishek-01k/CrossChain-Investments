import {
    Connection,
    Keypair,
    PublicKey,
    SendOptions,
    Transaction,
    VersionedTransaction,
  } from "@solana/web3.js";
  import {
    Chain,
    Network,
    SignAndSendSigner,
    UnsignedTransaction,
    Wormhole,
  } from "@wormhole-foundation/sdk";
//   import "./App.css";
  
  // Note: below is from the phantom sandbox
  // https://github.com/phantom/sandbox/blob/main/src/types.ts
  
  type DisplayEncoding = "utf8" | "hex";
  
  type PhantomEvent = "connect" | "disconnect" | "accountChanged";
  
  type PhantomRequestMethod =
    | "connect"
    | "disconnect"
    | "signAndSendTransaction"
    | "signAndSendTransactionV0"
    | "signAndSendTransactionV0WithLookupTable"
    | "signTransaction"
    | "signAllTransactions"
    | "signMessage";
  
  interface ConnectOpts {
    onlyIfTrusted: boolean;
  }
  
  export interface PhantomProvider {
    publicKey: PublicKey | null;
    isConnected: boolean | null;
    isPhantom: true;
    signAndSendTransaction: (
      transaction: Transaction | VersionedTransaction,
      opts?: SendOptions
    ) => Promise<{ signature: string; publicKey: PublicKey }>;
    signTransaction: (
      transaction: Transaction | VersionedTransaction
    ) => Promise<Transaction | VersionedTransaction>;
    signAllTransactions: (
      transactions: (Transaction | VersionedTransaction)[]
    ) => Promise<(Transaction | VersionedTransaction)[]>;
    signMessage: (
      message: Uint8Array | string,
      display?: DisplayEncoding
    ) => Promise<any>;
    connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
    disconnect: () => Promise<void>;
    on: (event: PhantomEvent, handler: (args: any) => void) => void;
    request: (method: PhantomRequestMethod, params: any) => Promise<unknown>;
  }
  
  // TODO: is this really not provided by web3.js?
  export function isVersionedTransaction(tx: any): tx is VersionedTransaction {
    return (
      (<VersionedTransaction>tx).signatures !== undefined &&
      (<VersionedTransaction>tx).message !== undefined
    );
  }
  
  export class PhantomSigner implements SignAndSendSigner<Network, Chain> {
    private constructor(
      private connection: Connection,
      private provider: PhantomProvider,
      private _address: string,
      private _chain: Chain
    ) {
      // TODO: Set up event handlers?
    }
  
    static async fromProvider(wh: Wormhole<Network>, provider: PhantomProvider) {
      if (!provider.publicKey)
        throw new Error("No public key, did you forget to call connect?");
  
      const ctx = wh.getChain("Solana");
      return new PhantomSigner(
        await ctx.getRpc(),
        provider,
        provider.publicKey.toBase58(),
        "Solana"
      );
    }
  
    chain(): Chain {
      return this._chain;
    }
    address(): string {
      return this._address;
    }
  
    async signAndSend(txs: UnsignedTransaction[]): Promise<string[]> {
      const txids: string[] = [];
  
      for (const txn of txs) {
        const { description, transaction } = txn as UnsignedTransaction<
          Network,
          "Solana"
        >;
        console.log(`Signing ${description}`);
  
        const { transaction: tx, signers } = transaction as {
          transaction: Transaction | VersionedTransaction;
          signers?: Keypair[];
        };
  
        // Set recent blockhash
        const { blockhash } = await this.connection.getLatestBlockhash();
        if (isVersionedTransaction(tx)) {
          tx.message.recentBlockhash = blockhash;
          if (signers && signers.length > 0) tx.sign(signers);
        } else {
          transaction.recentBlockhash = blockhash;
          if (signers && signers.length > 0) tx.partialSign(...signers);
        }
  
        // Partial sign with any signers passed in
        // NOTE: this _must_ come after any modifications to the transaction
        // otherwise, the signature wont verify
  
        const { signature: txid } =
          await this.provider.signAndSendTransaction(tx);
  
        if (!txid)
          throw new Error("Could not determine if transaction was sign and sent");
  
        txids.push(txid);
      }
  
      // Make sure they're all finalized
      await Promise.all(
        txids.map(async (txid) =>
          this.connection.confirmTransaction(txid, "finalized")
        )
      );
  
      return txids;
    }
  }