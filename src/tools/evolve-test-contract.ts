import Arweave from "arweave";
import { LoggerFactory, WarpNodeFactory } from "warp-contracts";
import * as fs from "fs";
import path from "path";
import { JWKInterface } from "arweave/node/lib/wallet";
import { deployedTestContracts } from "../deployed-contracts";
import { testKeyfile } from "../constants";

(async () => {
  // This is the testnet ArNS Registry Smartweave Contract TX ID
  const arnsRegistryContractTxId = deployedTestContracts.contractTxId;

  // Initialize Arweave
  const arweave = Arweave.init({
    host: "testnet.redstone.tools",
    port: 443,
    protocol: "https",
  });

  // Initialize `LoggerFactory`
  LoggerFactory.INST.logLevel("error");

  // Initialize SmartWeave
  const smartweave = WarpNodeFactory.memCached(arweave);

  // Get the key file used
  const wallet: JWKInterface = JSON.parse(
    await fs.readFileSync(testKeyfile).toString()
  );

  // Read the ArNS Registry Contract
  const pst = smartweave.pst(arnsRegistryContractTxId);
  pst.connect(wallet);

  // ~~ Read test contract source and initial state files ~~
  const newSource = fs.readFileSync(
    path.join(__dirname, "../../dist/contract.js"),
    "utf8"
  );
  const newSrcTxId = await pst.save({ src: newSource });
  if (newSrcTxId === null) {
    return 0;
  }
  await pst.evolve(newSrcTxId);

  console.log("Finished evolving the Test ArNS Smartweave Contract %s.", newSrcTxId);
})();
