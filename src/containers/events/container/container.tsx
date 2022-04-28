import React from 'react';
import styles from './style.module.css';

interface EventsProps {
  children?: React.ReactNode;
}

const Container: React.FC<EventsProps> = ({ children }) => {
  return <div className={styles.container}>{children}</div>;
};

export default Container;
