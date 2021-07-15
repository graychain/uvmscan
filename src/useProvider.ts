import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { ConnectionStatus } from "./types";

export const DEFAULT_ERIGON_URL = "http://127.0.0.1:8545";

export const useProvider = (
  erigonURL?: string
): [ConnectionStatus, ethers.providers.JsonRpcProvider | undefined] => {
  const [connStatus, setConnStatus] = useState<ConnectionStatus>(
    ConnectionStatus.CONNECTING
  );

  if (erigonURL !== undefined) {
    if (erigonURL === "") {
      console.info(`Using default erigon URL: ${DEFAULT_ERIGON_URL}`);
      erigonURL = DEFAULT_ERIGON_URL;
    } else {
      console.log(`Using configured erigon URL: ${erigonURL}`);
    }
  }

  const [provider, setProvider] = useState<
    ethers.providers.JsonRpcProvider | undefined
  >();
  useEffect(() => {
    if (erigonURL === undefined) {
      setConnStatus(ConnectionStatus.NOT_ETH_NODE);
      setProvider(undefined);
      return;
    }
    setConnStatus(ConnectionStatus.CONNECTING);

    const tryToConnect = async () => {
      const provider = new ethers.providers.JsonRpcProvider(
        erigonURL,
        "mainnet"
      );

      // Check if it is at least a regular ETH node
      let blockNumber: number = 0;
      try {
        blockNumber = await provider.getBlockNumber();
      } catch (err) {
        console.log(err);
        setConnStatus(ConnectionStatus.NOT_ETH_NODE);
        setProvider(undefined);
        return;
      }

      // Check if it is an Erigon node by probing a lightweight method
      try {
        await provider.send("erigon_getHeaderByNumber", [blockNumber]);
      } catch (err) {
        console.log(err);
        setConnStatus(ConnectionStatus.NOT_ERIGON);
        setProvider(undefined);
        return;
      }

      // Check if it has Otterscan patches by probing a lightweight method
      try {
        // TODO: replace by a custom made method that works in all networks
        await provider.send("ots_getTransactionTransfers", [
          "0x793e079fbc427cba0857b4e878194ab508f33983f45415e50af3c3c0e662fdf3",
        ]);
        setConnStatus(ConnectionStatus.CONNECTED);
        setProvider(provider);
      } catch (err) {
        console.log(err);
        setConnStatus(ConnectionStatus.NOT_OTTERSCAN_PATCHED);
        setProvider(undefined);
      }
    };
    tryToConnect();
  }, [erigonURL]);

  return [connStatus, provider];
};