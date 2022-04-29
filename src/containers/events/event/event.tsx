import React from 'react';
import Blockies from 'react-blockies';
import styles from './style.module.css';

interface EventProps {
  id: string;
  title: React.ReactNode;
  description: React.ReactNode;
}

const Event: React.FC<EventProps> = ({ id, title, description }) => {
  return (
    <div className={styles.root}>
      <div className={styles.avatarWrapper}>
        <Blockies seed={id} size={9} className={styles.avatar} />
      </div>
      <div className={styles.textWrapper}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  );
};

export default Event;
