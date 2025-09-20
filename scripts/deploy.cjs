async function main() {
  const ContractAPI = await hre.ethers.getContractFactory("ContractAPI");
  const contractAPI = await ContractAPI.deploy();

  await contractAPI.waitForDeployment();

  console.log(`Smart Contract deployed to: ${await contractAPI.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});