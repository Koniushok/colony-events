import React, { useEffect } from 'react';
import { ColonyClient } from '@colony/colony-js';
import { getEvents } from '../../api';

interface EventsProps {
  colonyClient: ColonyClient;
}

const Events: React.FC<EventsProps> = ({ colonyClient }) => {
  useEffect(() => {
    getEvents(colonyClient).then(events => {
      console.log(events);
    });
  }, [colonyClient]);

  return <div />;
};

export default Events;
