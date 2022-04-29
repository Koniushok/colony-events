import React, { useEffect, useState } from 'react';
import { ColonyClient } from '@colony/colony-js';

import Container from '../../components/container';
import { getColonyClient } from '../../api';
import Events from '../events';

const App: React.FC = () => {
  const [colonyClient, setColonyClient] = useState<undefined | ColonyClient>();
  const [error, setError] = useState<undefined | string>();

  useEffect(() => {
    getColonyClient()
      .then(client => {
        setError(undefined);
        setColonyClient(client);
      })
      .catch(() => setError('colony client fetch error'));
  }, []);

  if (error || !colonyClient) {
    return (
      <Container>
        <h1>{error ? error : '...loading'}</h1>
      </Container>
    );
  }

  return <Events colonyClient={colonyClient} />;
};

export default App;
