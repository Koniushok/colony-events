import { ColonyClient, getColonyNetworkClient, Network } from '@colony/colony-js';
import { Wallet } from 'ethers';
import { InfuraProvider } from 'ethers/providers';
import { getLogs, ColonyRole, getBlockTime } from '@colony/colony-js';
import { utils } from 'ethers';

import {
  ColonyInitialisedEventLog,
  EventLogTypes,
  DomainAddedEventLog,
  PayoutClaimedEventLog,
  EventLogs,
  ColonyRoleSetEventLog,
} from '../@types/events';

const MAINNET_NETWORK_ADDRESS = `0x5346D0f80e2816FaD329F2c140c870ffc3c3E2Ef`;
const MAINNET_BETACOLONY_ADDRESS = `0x869814034d96544f3C62DE2aC22448ed79Ac8e70`;

const provider = new InfuraProvider();
const wallet = Wallet.createRandom();
const connectedWallet = wallet.connect(provider);

const parseLogTime = async (blockHash: string) => {
  return new Date(await getBlockTime(provider, blockHash));
};

const parseBigNumber = (value: utils.BigNumberish): string => {
  return new utils.BigNumber(value).toString();
};

const parseUserAddress = async (colonyClient: ColonyClient, fundingPotId: utils.BigNumberish): Promise<string> => {
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

export const getColonyInitialisedEventLogs = async (
  colonyClient: ColonyClient,
): Promise<ColonyInitialisedEventLog[]> => {
  const eventFilter = colonyClient.filters.ColonyInitialised(null, null);
  const eventLogs = await getLogs(colonyClient, eventFilter);

  const parsedLogs = await Promise.all(
    eventLogs.map(async event => {
      const logTime = event.blockHash ? await parseLogTime(event.blockHash) : undefined;
      const userAddress = event.address;

      return {
        id: event.blockHash || userAddress,
        userAddress,
        logTime,
        type: EventLogTypes.ColonyInitialised as EventLogTypes.ColonyInitialised,
      };
    }),
  );

  return parsedLogs;
};

export const getColonyRoleSetEventLogs = async (colonyClient: ColonyClient): Promise<ColonyRoleSetEventLog[]> => {
  const eventFilter = (colonyClient.filters as any).ColonyRoleSet();
  const eventLogs = await getLogs(colonyClient, eventFilter);

  const parsedLogs = await Promise.all(
    eventLogs.map(async event => {
      const parsedEvent = colonyClient.interface.parseLog(event);

      const logTime = event.blockHash ? await parseLogTime(event.blockHash) : undefined;
      const domainId = parseBigNumber(parsedEvent.values.domainId);
      const userAddress = parsedEvent.values.user;

      return {
        id: event.blockHash || userAddress,
        role: ColonyRole[parsedEvent.values.role],
        logTime,
        domainId,
        userAddress,
        type: EventLogTypes.ColonyRoleSet as EventLogTypes.ColonyRoleSet,
      };
    }),
  );

  return parsedLogs;
};

export const getPayoutClaimedEventLogs = async (colonyClient: ColonyClient): Promise<PayoutClaimedEventLog[]> => {
  const eventFilter = colonyClient.filters.PayoutClaimed(null, null, null);
  const eventLogs = await getLogs(colonyClient, eventFilter);

  const parsedLogs = await Promise.all(
    eventLogs.map(async event => {
      const parsedEvent = colonyClient.interface.parseLog(event);

      const logTime = event.blockHash ? await parseLogTime(event.blockHash) : undefined;
      const userAddress = await parseUserAddress(colonyClient, parsedEvent.values.fundingPotId);
      const amount = parseBigNumber(parsedEvent.values.amount);
      const fundingPotId = parseBigNumber(parsedEvent.values.fundingPotId);
      const token = parseBigNumber(parsedEvent.values.token);

      return {
        id: event.blockHash || userAddress,
        logTime,
        userAddress,
        amount,
        fundingPotId,
        token,
        type: EventLogTypes.PayoutClaimed as EventLogTypes.PayoutClaimed,
      };
    }),
  );

  return parsedLogs;
};

export const getDomainAddedEventLogs = async (colonyClient: ColonyClient): Promise<DomainAddedEventLog[]> => {
  const eventFilter = colonyClient.filters.DomainAdded(null);
  const eventLogs = await getLogs(colonyClient, eventFilter);

  const parsedLogs = await Promise.all(
    eventLogs.map(async event => {
      const parsedEvent = colonyClient.interface.parseLog(event);

      const logTime = event.blockHash ? await parseLogTime(event.blockHash) : undefined;
      const domainId = parseBigNumber(parsedEvent.values.domainId);
      const userAddress = event.address;

      return {
        id: event.blockHash || userAddress,
        userAddress,
        logTime,
        domainId,
        type: EventLogTypes.DomainAdded as EventLogTypes.DomainAdded,
      };
    }),
  );

  return parsedLogs;
};

export const getEventLogs = async (colonyClient: ColonyClient): Promise<EventLogs[]> => {
  const events: EventLogs[] = [];
  const eventLists = await Promise.all([
    getColonyInitialisedEventLogs(colonyClient),
    getColonyRoleSetEventLogs(colonyClient),
    getPayoutClaimedEventLogs(colonyClient),
    getDomainAddedEventLogs(colonyClient),
  ]);

  eventLists.forEach(eventList => {
    events.push(...eventList);
  });

  return events.sort((eventA, eventB) => {
    if (eventA.logTime && eventB.logTime && eventA.logTime > eventB.logTime) {
      return -1;
    }
    return 1;
  });
};
