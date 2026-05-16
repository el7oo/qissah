"use client";

import { NextStudio } from 'next-sanity/studio';
import config from '../../../../sanity.config';
import dynamic from 'next/dynamic';

const StudioPage = () => {
  return <NextStudio config={config} />;
};

// Disable SSR for the studio page to prevent hydration errors
export default dynamic(() => Promise.resolve(StudioPage), {
  ssr: false,
});
