import React, { useEffect, useState } from 'react';
import { ColonyClient } from '@colony/colony-js';

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

  if (error) {
    return <h1>{error}</h1>;
  }
  if (!colonyClient) {
    return <h1>...loading</h1>;
  }
  return <Events colonyClient={colonyClient} />;
};

export default App;
