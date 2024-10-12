"use client";
import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import CCTPTransfer from "../cctp/page";
import { MetaMaskSDK, SDKProvider } from "@metamask/sdk";
import {
  Chain,
  Network,
  SignAndSendSigner,
  Signer,
  TokenTransfer,
  TokenTransferDetails,
  Wormhole,
  WormholeMessageId,
  amount,
  chainToPlatform,
  encoding,
  isNative,
  toChainId,
  wormhole,
} from "@wormhole-foundation/sdk";
import evm from "@wormhole-foundation/sdk/evm";
import solana from "@wormhole-foundation/sdk/solana";
import algorand from "@wormhole-foundation/sdk/algorand";

import { useEffect } from "react";

import { MetaMaskSigner } from "./metamask";
import { PhantomProvider, PhantomSigner } from "./phantom";
import Image from "next/image";

const msk = new MetaMaskSDK(
  {
    dappMetadata: {
        name: "CrossChain Investment",
        url: "https://cross-chain-investments.vercel.app",
    },
  }
);

export default function BridgePage() {
  const [bridgeType, setBridgeType] = useState("wormhole");

  return (
    <div className="min-h-screen bg-[#14151a] text-white flex flex-col items-center justify-start p-4">
      <div className="w-full max-w-md mb-8">
        <Label htmlFor="bridgeType" className="text-sm font-medium text-gray-400 mb-2">Select Bridge Type</Label>
        <Select value={bridgeType} onValueChange={setBridgeType}>
          <SelectTrigger id="bridgeType">
            <SelectValue placeholder="Select bridge type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="wormhole">Wormhole</SelectItem>
            <SelectItem value="cctp">Circle CCTP</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {bridgeType === "wormhole" ? (
        <div className="w-full max-w-md bg-[#1e1f25] rounded-lg p-4 space-y-4">
          <WormholeBridge />
        </div>
      ) : (
        <CCTPTransfer />
      )}
    </div>
  );
}

function WormholeBridge() {
  const NETWORK = "Testnet";

  const [evmProvider, setEvmProvider] = useState<SDKProvider | null>(null);
  const [evmSigner, setEvmSigner] = useState<SignAndSendSigner<Network , Chain> | null>(null);
  const [phantomProvider, setPhantomProvider] = useState<PhantomProvider | null>(null);
  const [solSigner, setSolSigner] = useState<SignAndSendSigner<Network , Chain> | null>(null);
  const [srcChain, setSrcChain] = useState<Chain>("Avalanche");
  const [dstChain, setDstChain] = useState<Chain>("Solana");
  const [transfer, setTransfer] = useState<TokenTransfer | null>(null);
  const [transferDetails, setTransferDetails] = useState<TokenTransferDetails | null>(null);
  const [srcTxIds, setSrcTxIds] = useState<string[]>([]);
  const [attestations, setAttestations] = useState<WormholeMessageId[]>([]);
  const [dstTxIds, setDstTxIds] = useState<string[]>([]);
  const [wh, setWormhole] = useState<Wormhole<Network> | null>(null);

  useEffect(() => {
    if (!wh) wormhole(NETWORK, [evm, solana]).then(setWormhole);
  }, [wh]);

  useEffect(() => {
    if (phantomProvider || !("phantom" in window) || !wh) return;
    (async function () {
      const provider = (window as any).phantom?.solana as PhantomProvider;
      if (!provider?.isPhantom) return;
      await provider.connect();
      await PhantomSigner.fromProvider(wh, provider).then((signer) => {
        setSolSigner(signer);
      });
      setPhantomProvider(provider);
    })().catch(console.error);
  }, [phantomProvider, wh]);

  useEffect(() => {
    if (evmProvider) return;
    (async function () {
      await msk.connect();
      const provider = msk.getProvider();
      await MetaMaskSigner.fromProvider(provider).then((signer) => {
        setEvmSigner(signer);
      });
      setEvmProvider(provider);
    })().catch(console.error);
  }, [evmProvider]);

  function getSigner(chain: Chain): Signer {
    const isEvm = chainToPlatform(chain) === "Evm"
    const s = isEvm ? evmSigner : solSigner;
    if (!s) throw new Error("No signer for: " + chain)
    if (isEvm) {
      (s as MetaMaskSigner).requestChainChange(chain)
    }
    return s
  }

  function getAddresses(): Record<Chain, string> {
    try {
      const srcAddress = getSigner(srcChain).address();
      const dstAddress = getSigner(dstChain).address();
      return { [srcChain]: srcAddress, [dstChain]: dstAddress } as Record<Chain, string>;
    } catch {
      return { [srcChain]: "Not connected", [dstChain]: "Not connected" } as Record<Chain, string>;
    }
  }

  async function start() {
    if (!wh) throw new Error("No wormhole");
    const signer = getSigner(srcChain)
    if (!signer) throw new Error("No signer");

    const chainCtx = wh.getChain(signer.chain());
    const amt = amount.units(amount.parse("0.01", chainCtx.config.nativeTokenDecimals));
    const snd = Wormhole.chainAddress(signer.chain(), signer.address());
    const tkn = Wormhole.tokenId(chainCtx.chain, "native");

    const dstSigner = getSigner(dstChain)
    const rcv = Wormhole.chainAddress(dstSigner.chain(), dstSigner.address());
    const xfer = await wh.tokenTransfer(tkn, amt, snd, rcv, false);

    setTransfer(xfer);
    setTransferDetails(xfer.transfer);

    const txids = await xfer.initiateTransfer(signer);
    setSrcTxIds(txids);

    const att = await xfer.fetchAttestation(60_000);
    setAttestations(att);
  }

  async function finish() {
    if (!wh) throw new Error("No wormhole");
    if (!transfer) throw new Error("No Current transfer");

    const signer = dstChain === "Solana" ? solSigner : evmSigner;
    if (!signer) throw new Error("No signer");

    const finalTxs = await transfer.completeTransfer(signer);
    setDstTxIds(finalTxs);
  }

  return (
    <>
      <FromSection srcChain={srcChain} setSrcChain={setSrcChain} getAddresses={getAddresses} />
      <ToSection dstChain={dstChain} setDstChain={setDstChain} getAddresses={getAddresses} />
      <RouteSection start={start} finish={finish} srcTxIds={srcTxIds} attestations={attestations} />
      <TransferDetailsCard
        details={transferDetails}
        attestations={attestations}
        srcTxIds={srcTxIds}
        dstTxIds={dstTxIds}
      />
    </>
  );
}

interface SectionProps {
  srcChain: Chain;
  setSrcChain: React.Dispatch<React.SetStateAction<Chain>>;
  getAddresses: () => Record<Chain, string>;
}

function FromSection({ srcChain, setSrcChain, getAddresses }: SectionProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-medium text-gray-400">From</h2>
        <div className="text-xs bg-[#282a30] rounded-full px-2 py-1 flex items-center space-x-1">
          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
          <span className="truncate">{getAddresses()[srcChain]}</span>
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
        </div>
      </div>
      <div className="bg-[#282a30] rounded-md p-3 mb-2">
        <select
          value={srcChain}
          onChange={(e) => setSrcChain(e.target.value as Chain)}
          className="bg-transparent w-full focus:outline-none"
        >
          <option value="Avalanche">Avalanche</option>
          <option value="Ethereum">Ethereum</option>
          <option value="Solana">Solana</option>
        </select>
      </div>
      <div className="bg-[#282a30] rounded-md p-3 flex justify-between items-center">
        <div>
          <input type="text" value="0.00" className="bg-transparent w-20 text-lg font-medium focus:outline-none" />
          <span className="text-xs text-gray-400">($0.00)</span>
        </div>
        <span className="text-sm text-gray-400">Balance: —</span>
      </div>
    </div>
  )
}

function ToSection({ dstChain, setDstChain, getAddresses }: SectionProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-medium text-gray-400">To</h2>
        <div className="text-xs bg-[#282a30] rounded-full px-2 py-1 flex items-center space-x-1">
          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
          <span className="truncate">{getAddresses()[dstChain]}</span>
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
        </div>
      </div>
      <div className="bg-[#282a30] rounded-md p-3 mb-2">
        <select
          value={dstChain}
          onChange={(e) => setDstChain(e.target.value as Chain)}
          className="bg-transparent w-full focus:outline-none"
        >
          <option value="Avalanche">Avalanche</option>
          <option value="Ethereum">Ethereum</option>
          <option value="Solana">Solana</option>
        </select>
      </div>
      <div className="bg-[#282a30] rounded-md p-3 flex justify-between items-center">
        <div>
          <input type="text" value="0" className="bg-transparent w-20 text-lg font-medium focus:outline-none" />
          <span className="text-xs text-gray-400">($0.00)</span>
        </div>
        <span className="text-sm text-gray-400">Balance: 0</span>
      </div>
    </div>
  )
}

interface RouteSectionProps {
  start: () => Promise<void>;
  finish: () => Promise<void>;
  srcTxIds: string[];
  attestations: WormholeMessageId[];
}

function RouteSection({ start, finish, srcTxIds, attestations }: RouteSectionProps) {
  return (
    <div>
      <h2 className="text-sm font-medium text-gray-400 mb-2">Route</h2>
      <div className="bg-[#34373f] rounded-md p-2 text-xs mb-2">
        This route provided by Wormhole
      </div>
      <BridgeOption 
        title="Start Transfer"
        buttonText="Initiate Transfer"
        route={['Source', 'Wormhole', 'Destination']}
        icon="/wormhole-icon.svg"
        onClick={start}
        disabled={srcTxIds.length > 0}
      />
      <BridgeOption 
        title="Complete Transfer"
        buttonText="Finish Transfer"
        route={['Source', 'Wormhole', 'Destination']}
        icon="/wormhole-icon.svg"
        onClick={finish}
        disabled={attestations.length === 0}
      />
    </div>
  )
}

interface BridgeOptionProps {
  title: string;
  buttonText: string;
  route: string[];
  icon: string;
  onClick: () => Promise<void>;
  disabled: boolean;
}

function BridgeOption({ title, buttonText, route, icon, onClick, disabled }: BridgeOptionProps) {
  return (
    <div className="bg-[#282a30] rounded-md p-3 mb-2">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">{title}</span>
        <button 
          className="bg-[#34373f] text-xs rounded-full px-3 py-1 hover:bg-opacity-80 transition-colors"
          onClick={onClick}
          disabled={disabled}
        >
          {buttonText}
        </button>
      </div>
      <div className="flex items-center space-x-2 mb-2">
        {route.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-gray-400">→</span>}
            <div className="flex items-center space-x-1">
              <Image src={icon} alt={item} width={12} height={12} />
              <span className="text-xs">{item}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
      <div className="text-xs text-gray-400">
        Estimated time: 2-5 minutes
      </div>
    </div>
  )
}

interface TransferDetailsCardProps {
  details: TokenTransferDetails | null;
  attestations: WormholeMessageId[];
  srcTxIds: string[];
  dstTxIds: string[];
}

function TransferDetailsCard({ details, attestations, srcTxIds, dstTxIds }: TransferDetailsCardProps) {
  if (!details) return null;

  const token = isNative(details.token.address) ? "Native" : details.token.address.toString();

  return (
    <div className="bg-[#282a30] rounded-md p-3 mb-2 text-sm">
      <h3 className="font-medium mb-2">Transfer Details</h3>
      <p>From: {details.from.chain} : {details.from.address.toString()}</p>
      <p>To: {details.to.chain} : {details.to.address.toString()}</p>
      <p>Token: {token}</p>
      <p>Amount: {details.amount.toString()}</p>
      <h4 className="font-medium mt-2 mb-1">Source Transactions</h4>
      <p>{srcTxIds.length > 0 ? srcTxIds.join(", ") : "None"}</p>
      <h4 className="font-medium mt-2 mb-1">Attestations</h4>
      <p>
        {attestations.length > 0
          ? attestations
              .map((att) => {
                const whChainId = toChainId(att.chain);
                const emitter = encoding.stripPrefix("0x", att.emitter.toString());
                return `${whChainId}/${emitter}/${att.sequence}`;
              })
              .join(", ")
          : "None"}
      </p>
      <h4 className="font-medium mt-2 mb-1">Destination Transactions</h4>
      <p>{dstTxIds.length > 0 ? dstTxIds.join(", ") : "None"}</p>
    </div>
  );
}