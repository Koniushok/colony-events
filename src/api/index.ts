import { ColonyClient, getColonyNetworkClient, Network } from '@colony/colony-js';
import { Wallet } from 'ethers';
import { InfuraProvider } from 'ethers/providers';
import { getLogs, ColonyRole, getBlockTime } from '@colony/colony-js';
import { utils } from 'ethers';

const MAINNET_NETWORK_ADDRESS = `0x5346D0f80e2816FaD329F2c140c870ffc3c3E2Ef`;
const MAINNET_BETACOLONY_ADDRESS = `0x869814034d96544f3C62DE2aC22448ed79Ac8e70`;

const provider = new InfuraProvider();
const wallet = Wallet.createRandom();
const connectedWallet = wallet.connect(provider);

enum EventTypes {
  ColonyRoleSet = 'ColonyRoleSet',
  ColonyInitialised = 'ColonyInitialised',
  PayoutClaimed = 'PayoutClaimed',
  DomainAdded = 'DomainAdded',
}

interface ColonyEventBase<Type extends EventTypes> {
  logTime: Date;
  type: Type;
}

interface ColonyRoleSetEvent extends ColonyEventBase<EventTypes.ColonyRoleSet> {
  role: string;
  domainId: string;
}

interface ColonyInitialisedEvent extends ColonyEventBase<EventTypes.ColonyInitialised> {}

interface PayoutClaimedEvent extends ColonyEventBase<EventTypes.PayoutClaimed> {
  userAddress: string;
  amount: string;
  fundingPotId: string;
  token: string;
}

interface DomainAddedEvent extends ColonyEventBase<EventTypes.DomainAdded> {
  domainId: string;
}

type Events = ColonyRoleSetEvent | ColonyInitialisedEvent | PayoutClaimedEvent | DomainAddedEvent;

const parseLogTime = async (blockHash: string) => {
  return new Date(await getBlockTime(provider, blockHash));
};

const parseBigNumber = (value: utils.BigNumberish): string => {
  return new utils.BigNumber(value).toString();
};

const parseUserAddress = async (
  colonyClient: ColonyClient,
  fundingPotId: utils.BigNumberish,
): Promise<string> => {
  const humanReadableFundingPotId = new utils.BigNumber(fundingPotId).toString();

  const { associatedTypeId } = await colonyClient.getFundingPot(humanReadableFundingPotId);

  const { recipient: userAddress } = await colonyClient.getPayment(associatedTypeId);
  return userAddress;
};

export const getColonyClient = async (): Promise<ColonyClient> => {
  const networkClient = await getColonyNetworkClient(Network.Mainnet, connectedWallet, {
    networkAddress: MAINNET_NETWORK_ADDRESS,
  });
  const colonyClient = await networkClient.getColonyClient(MAINNET_BETACOLONY_ADDRESS);

  return colonyClient;
};

export const getColonyInitialisedEvents = async (
  colonyClient: ColonyClient,
): Promise<ColonyInitialisedEvent[]> => {
  const eventFilter = colonyClient.filters.ColonyInitialised(null, null);
  const eventLogs = await getLogs(colonyClient, eventFilter);

  const parsedLogs = await Promise.all(
    eventLogs.map(async event => {
      const parsedEvent = colonyClient.interface.parseLog(event);
      const logTime = await parseLogTime(parsedEvent.blockHash);

      return {
        logTime,
        type: EventTypes.ColonyInitialised as EventTypes.ColonyInitialised,
      };
    }),
  );

  return parsedLogs;
};

export const getColonyRoleSetEvents = async (
  colonyClient: ColonyClient,
): Promise<ColonyRoleSetEvent[]> => {
  const eventFilter = colonyClient.filters.ColonyRoleSet(null, null, null);
  const eventLogs = await getLogs(colonyClient, eventFilter);
  console.log(eventLogs);

  const parsedLogs = await Promise.all(
    eventLogs.map(async event => {
      const parsedEvent = colonyClient.interface.parseLog(event);

      const logTime = await parseLogTime(parsedEvent.blockHash);
      const domainId = parseBigNumber(parsedEvent.values.domainId);

      return {
        role: ColonyRole[parsedEvent.values.role],
        logTime,
        domainId,
        type: EventTypes.ColonyRoleSet as EventTypes.ColonyRoleSet,
      };
    }),
  );

  return parsedLogs;
};

export const getPayoutClaimedEvents = async (
  colonyClient: ColonyClient,
): Promise<PayoutClaimedEvent[]> => {
  const eventFilter = colonyClient.filters.PayoutClaimed(null, null, null);
  const eventLogs = await getLogs(colonyClient, eventFilter);

  const parsedLogs = await Promise.all(
    eventLogs.map(async event => {
      const parsedEvent = colonyClient.interface.parseLog(event);

      const logTime = await parseLogTime(parsedEvent.blockHash);
      const userAddress = await parseUserAddress(colonyClient, parsedEvent.values.fundingPotId);
      const amount = parseBigNumber(parsedEvent.values.amount);
      const fundingPotId = parseBigNumber(parsedEvent.values.fundingPotId);
      const token = parseBigNumber(parsedEvent.values.token);

      return {
        logTime,
        userAddress,
        amount,
        fundingPotId,
        token,
        type: EventTypes.PayoutClaimed as EventTypes.PayoutClaimed,
      };
    }),
  );

  return parsedLogs;
};

export const getDomainAddedEvents = async (
  colonyClient: ColonyClient,
): Promise<DomainAddedEvent[]> => {
  const eventFilter = colonyClient.filters.DomainAdded(null);
  const eventLogs = await getLogs(colonyClient, eventFilter);

  const parsedLogs = await Promise.all(
    eventLogs.map(async event => {
      const parsedEvent = colonyClient.interface.parseLog(event);

      const logTime = await parseLogTime(parsedEvent.blockHash);
      const domainId = parseBigNumber(parsedEvent.values.domainId);

      return {
        logTime,
        domainId,
        type: EventTypes.DomainAdded as EventTypes.DomainAdded,
      };
    }),
  );

  return parsedLogs;
};

export const getEvents = async (colonyClient: ColonyClient): Promise<Events[]> => {
  const colonyInitialisedEvents = await getColonyInitialisedEvents(colonyClient);
  const colonyRoleSetEvents = await getColonyRoleSetEvents(colonyClient);
  const payoutClaimedEvents = await getPayoutClaimedEvents(colonyClient);
  // const domainAddedEvents = await getDomainAddedEvents(colonyClient);
  console.log(colonyInitialisedEvents);
  return [
    ...colonyInitialisedEvents,
    ...colonyRoleSetEvents,
    ...payoutClaimedEvents,
    // ...domainAddedEvents,
  ];
};
