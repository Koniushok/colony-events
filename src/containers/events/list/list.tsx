import React from 'react';
import styles from './style.module.css';

interface ListProps {
  children?: React.ReactNode;
}

const List: React.FC<ListProps> = ({ children }) => {
  return <div className={styles.root}>{children}</div>;
};

export default List;
