import React, { useEffect } from 'react';
import { ColonyClient } from '@colony/colony-js';
import { getEvents } from '../../api';

import Container from './container';
import List from './list';
import Event from './event';

interface EventsProps {
  colonyClient: ColonyClient;
}

const Events: React.FC<EventsProps> = ({ colonyClient }) => {
  useEffect(() => {
    getEvents(colonyClient).then(events => {
      console.log(events);
    });
  }, [colonyClient]);

  return (
    <Container>
      <List>
        <Event title="title" description="description" />
        <Event title="title" description="description" />
        <Event title="title" description="description" />
      </List>
    </Container>
  );
};

export default Events;
