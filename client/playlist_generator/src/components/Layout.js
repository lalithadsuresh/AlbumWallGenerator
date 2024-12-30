import React from 'react';
import ButtonAppBar from './AppBar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <>
      <ButtonAppBar />
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default Layout;