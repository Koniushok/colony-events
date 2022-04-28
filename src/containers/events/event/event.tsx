import React from 'react';
import Blockies from 'react-blockies';
import styles from './style.module.css';

interface EventProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
}

const Event: React.FC<EventProps> = ({ title, description }) => {
  return (
    <div className={styles.wrapper}>
      <Blockies
        seed="0x869814034d96544f3C62DE2aC22448ed79Ac8e70"
        size={9}
        className={styles.avatar}
      />
      <div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  );
};

export default Event;
