import React, { useEffect, useState } from 'react';
import { ColonyClient } from '@colony/colony-js';
import Container from '../../components/container';
import List from './list';
import Event from './event';

import { getEventLogs } from '../../api';
import { EventLogs, EventLogTypes } from '../../@types/events';

interface EventsProps {
  colonyClient: ColonyClient;
}

const Events: React.FC<EventsProps> = ({ colonyClient }) => {
  const [eventLogs, setEventLogs] = useState<undefined | EventLogs[]>();
  const [error, setError] = useState<undefined | string>();

  useEffect(() => {
    getEventLogs(colonyClient)
      .then(eventLogs => {
        setError(undefined);
        setEventLogs(eventLogs);
      })
      .catch(() => setError('event logs fetch error'));
  }, [colonyClient]);

  const renderEventLogTitle = (eventLog: EventLogs) => {
    switch (eventLog.type) {
      case EventLogTypes.ColonyInitialised:
        return "Congratulations! It's a beautiful baby colony!";
      case EventLogTypes.ColonyRoleSet:
        return (
          <>
            <strong>{eventLog.role}</strong> role assigned to user <strong>{eventLog.userAddress}</strong> in domain{' '}
            <strong>{eventLog.domainId}</strong>
          </>
        );
      case EventLogTypes.PayoutClaimed:
        return (
          <>
            User <strong>{eventLog.userAddress}</strong> claimed <strong>{eventLog.amount}</strong>
            <strong>{eventLog.token}</strong> payout from pot <strong>{eventLog.fundingPotId}</strong>
          </>
        );
      case EventLogTypes.DomainAdded:
        return (
          <>
            Primary: Domain <strong>{eventLog.domainId}</strong> added.
          </>
        );
      default:
        return null;
    }
  };

  if (error || !eventLogs) {
    return (
      <Container>
        <h1>{error ? error : '...loading'}</h1>
      </Container>
    );
  }

  return (
    <Container>
      <List>
        {eventLogs.map(eventLog => (
          <Event
            key={eventLog.id}
            title={renderEventLogTitle(eventLog)}
            description={
              eventLog.logTime && eventLog.logTime.toLocaleDateString('en', { day: 'numeric', month: 'short' })
            }
            id={eventLog.userAddress}
          />
        ))}
      </List>
    </Container>
  );
};

export default Events;
