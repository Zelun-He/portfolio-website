import React from 'react';
import { motion } from 'framer-motion';

const variants = {
  default: { width: 0 },
  active: { width: 'calc(100% - 0.75rem)' },
};

const TabButton = ({ active, selectTab, children }) => {
  const buttonClasses = active
    ? 'text-white border-b border-orange-500'
    : 'text-[ADB7BE] border-b border-orange-500';

  return (
    <motion.button 
      onClick={selectTab}
      whileHover={{ 
        scale: 1.1,
        y: -5,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.95 }}
      className="cursor-pointer"
    >
      <p className={`mr-3 font-semibold hover:text-white ${buttonClasses}`}>
        {children}
      </p>
      <motion.div
        animate={active ? 'active' : 'default'}
        variants={variants}
        className="h-1 bg-primary-500 mt-2 mr-3"
      />
    </motion.button>
  );
};

export default TabButton;
