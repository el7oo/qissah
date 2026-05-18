"use client";

import React from 'react';

export function ProductSkeleton() {
  return (
    <div className="pc" style={{ cursor: 'default' }}>
      <div className="pc-img-wrap">
        <div className="skel" style={{ width: '100%', aspectRatio: '1' }}></div>
      </div>
      <div className="pc-body" style={{ padding: '12px' }}>
        <div className="skel" style={{ height: '14px', width: '80%', marginBottom: '8px', borderRadius: '4px' }}></div>
        <div className="skel" style={{ height: '14px', width: '60%', marginBottom: '12px', borderRadius: '4px' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="skel" style={{ height: '18px', width: '40%', borderRadius: '4px' }}></div>
          <div className="skel" style={{ width: '32px', height: '32px', borderRadius: '50%' }}></div>
        </div>
      </div>
    </div>
  );
}
