export enum EventLogTypes {
  ColonyRoleSet = 'ColonyRoleSet',
  ColonyInitialised = 'ColonyInitialised',
  PayoutClaimed = 'PayoutClaimed',
  DomainAdded = 'DomainAdded',
}

export interface ColonyEventBaseLog<Type extends EventLogTypes> {
  id: string;
  logTime: Date;
  type: Type;
  userAddress: string;
}

export interface ColonyRoleSetEventLog extends ColonyEventBaseLog<EventLogTypes.ColonyRoleSet> {
  role: string;
  domainId: string;
}

export interface ColonyInitialisedEventLog
  extends ColonyEventBaseLog<EventLogTypes.ColonyInitialised> {}

export interface PayoutClaimedEventLog extends ColonyEventBaseLog<EventLogTypes.PayoutClaimed> {
  amount: string;
  fundingPotId: string;
  token: string;
}

export interface DomainAddedEventLog extends ColonyEventBaseLog<EventLogTypes.DomainAdded> {
  domainId: string;
}

export type EventLogs =
  | ColonyRoleSetEventLog
  | ColonyInitialisedEventLog
  | PayoutClaimedEventLog
  | DomainAddedEventLog;
