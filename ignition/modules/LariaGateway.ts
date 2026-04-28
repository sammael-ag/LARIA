import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("LariaGatewayModule", (m) => {
  // TOTO JE ADRESA TVOJHO LARIA TOKENU (Z tvojej ranného bádania)
  const lariaTokenAddress = "0xbA7C2cD68b544Cc5c6038771a58581F76Ff7700a"; 

  // Pripravíme kontrakt na nasadenie a pošleme mu adresu tokenu do constructor-a
  const gateway = m.contract("LariaGateway", [lariaTokenAddress]);

  return { gateway };
});