import React from 'react';
import { TopHeader } from './TopHeader';
export { TopHeader } from './TopHeader';
export { Sidebar } from './Sidebar';
export type { NavModule } from './Sidebar';

// Re-export Navbar as TopHeader for backwards compatibility
export const Navbar = TopHeader;
